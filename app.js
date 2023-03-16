/**
 * MODULES
 */
// pour gérer la BDD mySQL
const mysql = require('mysql2');
// on va créer une app express
const express = require('express');
// pour lire les requêtes HTTP
const bodyParser = require('body-parser');
// moteur de vues
const ejs = require('ejs');


/**
 * CONSTANTES
 */
// nom de la BDD
const DB = "neoness"; /* A REMPLIR */
const HOST = '0.0.0.0';
const PORT = 8080;


/**
 * INSTANCIATIONS
 */
const app = express();

/* paramétrage de l'app */
app.use(bodyParser.urlencoded({ extended: true })); 
// on demande à ce que les résultats de requêtes soient sous forme d'objets JSON
app.use(bodyParser.json());

// définition du moteur de vues
app.set("view engine", "ejs");
// et du répertoire de vues
app.set("views", "./views");

// autorisation d'accès aux fichiers statiques du répertoire public
app.set(express.static("public"));

// instanciation de la connexion à la BDD
const con = mysql.createConnection({
    host:'172.17.0.2',
    user:'pedrolove',
    password:'ThePassword',
    database:'neoness',
    multipleStatements: true
});

con.connect((err) => {
    if (err) throw err;
    console.log(`Connecté à la BDD ${DB}`);
});


/**
 * ROUTES
 */

// route d'accueil
app.get('/', (req, res) => {
    // comment vérifier si un utilisateur est loggé ?
    // redirige par défaut vers la page de connexion
    res.redirect('/login');
});

/* READ */
// route vers le dashboard admin
app.get('/admin', (req, res) => {
    // comment vérifier dans le cache que le client est admin avant d'arriver ici ??
    // problème : vu que l'admin est directement redirigé ici la connexion, il n'est pas stocké dans le session storage

    // requête pour récupérer les données de tous les utilisateurs
    let queryAllUsers = "SELECT user_pseudo AS Pseudo, name AS Nom, prenom AS Prénom, tel AS Téléphone, taille AS Taille, poids AS Poids, objectif AS Objectif, pass AS MDP, autorisation AS Droits FROM user;";
    
    // connexion à la BDD
    con.connect((err) => {
        if (err) throw err;

        // envoi de la requête
        con.query(queryAllUsers, (err, results) => {
            if (err) throw err;

            // affichage de la page admin
            res.render("admin", {
                'title': "Dashboard admin",
                'results': results /* envoi des résultats de la requête */
            });
        }); // fin con.query
    }); // fin con.connect
}); // fin GET /admin

/* CREATE */
// route recevant le formulaire d'inscription d'utilisateur
app.post('/signin', (req,res) => {
    let name = req.body.name;
    let prenom = req.body.prenom;
    let tel = req.body.tel;
    let poids = req.body.poids;
    let taille = req.body.taille;
    let objectif = req.body.objectif;
    let pseudo = req.body.pseudo;
    let pass = req.body.pass;
    let avatar = req.body.avatar;

    // on va vérifier que le pseudo demandé n'est pas déjà attribué
    let checkUser = "SELECT user_pseudo, autorisation, id_user FROM user WHERE user_pseudo = ?" /* ? pour des requêtes sécurisées */;
    // connexion à la BDD
    con.connect((err) => {
        if (err) throw err;
        // envoi de la requête
        con.query(checkUser, [pseudo], (err, results) => {
            if (err) throw err;

            // si la requête n'a pas retourné de résultat <=> si le pseudo est libre
            if (!results.length){
                // on peut ++ l'utilisateur à la BDD
                // let myquery = 'ALTER TABLE user AUTO_INCREMENT = MAX(id_user) ;' 
                // requête d'ajout utilisateur
                let myquery = "INSERT INTO user (name, prenom, tel, poids, taille, objectif, pass, user_pseudo, avatar) VALUES (?,?,?,?,?,?,?,?,?) "
                // connexion BDD
                con.connect((err)=>{
                    if (err) throw err;
                    // envoi requête
                    con.query(myquery, [name, prenom, tel, poids, taille, objectif, pass, pseudo, avatar], (err,results) => {
                        // on va immédiatement connecté l'utilisateur
                        let queryUser = "SELECT * FROM user WHERE user_pseudo = ? AND pass = ?;";
                        con.query(queryUser, [pseudo, pass], (err, results) => {
                        // création d'un objet JSON contenant les informations essentielles de l'utilisateur connecté ;
                        // cet objet va servir de cache dans le session storage client
                        let userStorage = {
                            'id_user': results[0].id_user,
                            'username': results[0].pseudo,
                            'rights': results[0].autorisation
                        }
                            // on envoi l'utilisateur à la page d'accueil
                            res.render('welcome', { 'title': 'Accueil', 
                                'message': `Welcome ${prenom}`,
                                /* et on envoie l'objet JSON du cache */
                                'storage': userStorage,
                                'results': results[0]
                            });
                        });
                    });
                }); 
            }
            // sinon, si le pseudo est déjà pris, on envoie un message d'erreur
            else {
                res.render('sport_login', {'title': 'Sign In', 'message': 'Inscription', 'erreur': "Pseudo déjà attribué" })
            }
        }); // fin con.query
    }); // fin con.connect
}); // fin POST /signin

// route affichant la page de log in
app.get('/login', (req,res) => {
    res.render("sport_login", {'title': 'Log In', 'message': 'Veuillez entrer vos identifiants afin de vous connecter', 'erreur':""})
}); // fin GET /login

// route permettant de logger un utilisateur
app.post('/confirm', (req,res) => {
    let pseudo = req.body.pseudo;
    let pass = req.body.pass;
    // requête qui va sélectionner une rangée dans la BDD selon un pseudo et un mdp (entrés par le client)
    let myquery = "SELECT * FROM user WHERE user_pseudo = ? AND pass = ?;";
    // connexion BDD
    con.connect(function(err){
        if (err) throw err;
        // envoi requête
        con.query(myquery, [pseudo, pass], function(err,results){
            if (err) throw err;
            
            // si la requête a retourné un résultat
            if(results.length){
                // on va enregistrer l'utilisateur dans le cache local, donc on crée l'objet JSON à envoyer
                let userStorage = {
                    'id_user': results[0].id_user,
                    'username': results[0].pseudo,
                    'avatar': results[0].avatar,
                    'rights': results[0].autorisation
                }
                // on évalue le statut de l'utilisateur (autorisation = user ou admin)
                if (results[0].autorisation == 'admin'){
                    // si c'est un admin, on le redirige vers le dashboard admin
                    res.redirect('/admin');
                }
                // sinon, si c'est un client normal
                // on supprime la clef "autorisation" car l'utilisateur n'a pas besoin de connaître ses droits dans la BDD
                delete results[0].autorisation;
                // et on le redirigie vers sa page utilisateur
                res.render('welcome', { 'title': 'Accueil', 
                    'message': `Welcome ${results[0].prenom}`,
                    'storage': userStorage, /* envoi du cache */
                    'results': results[0] /* envoi de toutes ses informations */
                });
            } else {
                // sinon, si les identifiants ne correspondent à rien dans la BDD, on envoie un message d'erreur sur la page de connexion
                res.render('sport_login' , { 'title' : 'Login', 'message': "Connexion", 'erreur' : 'Identifiant incorrect'})
            }
        });
    });
}); // fin POST /confirm

/* UPDATE */
// route recevant les données utilisateur à mettre à jour
app.post('/update', (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    let prenom = req.body.prenom;
    let tel = req.body.tel;
    let poids = req.body.poids;
    let taille = req.body.taille;
    let objectif = req.body.objectif;
    let pseudo = req.body.pseudo;
    let pass = req.body.pass;
    let avatar = req.body.avatar1;
    let queryUpd = `UPDATE user SET name = '${name}', prenom = '${prenom}', tel = '${tel}', poids = '${poids}', taille = '${taille}', objectif = '${objectif}', pass = '${pass}', user_pseudo = '${pseudo}', avatar = '${avatar}' WHERE id_user = ${id}`;
    // connexion BDD
    con.connect((err)=>{
        if (err) throw err;
        // on envoie la requête de mise à jour
        con.query(queryUpd, (err,results)=>{
            if (err) throw err;
            // une fois la màj effectuée dans la BDD
            let queryUser = "SELECT * FROM user WHERE id_user = ?;";
            
            con.query(queryUser, [id], (err, results) => {
                // on réaffiche la page avec les résultats mis à jour
                res.render('welcome', { 'title': 'Accueil', 
                    'message': `Welcome ${prenom}`,
                    /* on n'envoie pas les données du cache car le client est déjà loggé */
                    'storage': '',
                    'results': results[0]
                });
            })
        });
    });
}); // fin POST /update

/* DELETE */
// route supprimant un client de la BDD et le redirigeant vers la page de login
app.post('/deleteUser', (req,res) => {
    let id = req.body.id;
    let myquery = `DELETE FROM user WHERE id_user = ${id};`
    con.connect((err) => {
        if (err) throw err;
        con.query(myquery, (err, results) => {
            if (err) throw err;
            res.redirect('/login')
        });
    });
}); // fin POST /deleteUser



app.post('/seance', (req,res) => {
    let id = req.body.id;
    let myqueryActFav = "SELECT type AS fav, SUM(time) AS time FROM activite_physique ";
    myqueryActFav += "INNER JOIN seance ON seance.id_activite = activite_physique.id_activite_physique ";
    myqueryActFav += "INNER JOIN user ON user.id_user = seance.id_user ";
    myqueryActFav += `WHERE seance.id_user=${id} `;
    myqueryActFav += "GROUP BY fav ";
    myqueryActFav += "ORDER BY time DESC ";
    console.log(myqueryActFav)
    con.connect((err)=>{
        if (err) throw err;
        con.query(myqueryActFav, (err,results) => {
            if(err) throw err;
            console.log(results);
            let message = "";
            if (results.length>0){
                message = `Votre activité favorite est : ${results[0].fav}, avec un total de durée de séance de ${results[0].time} minutes.`
                console.log(results[0].fav);
            } else {
                message = "Vous n'avez renseigné aucune activité.";
            }
            console.log(message);
            let myquery = "SELECT user.id_user, user.avatar, user.user_pseudo, type, image, time, DATE_FORMAT(date, '%W %e %M %Y') AS date FROM seance " ;
            myquery += "INNER JOIN activite_physique ON activite_physique.id_activite_physique = seance.id_activite " ;
            myquery += "INNER JOIN user ON user.id_user = seance.id_user " ;
            myquery += `WHERE user.id_user=${id} `;
            myquery += `ORDER BY DATE_FORMAT(date, '%Y%c%d') `;
            con.query(myquery, (err,results) => {
                let seances = results;
                let queryUser = `SELECT * FROM user WHERE id_user = ${id}`;
                console.log(queryUser)
                con.query(queryUser, (err, results) => {
                    console.log(results)
                    if (seances.length>0) {
                        if (err) throw err;
                        res.render('sport_seance', {'title': 'liste de vos séances', 'results' : seances, 'message': message, "user_info": results[0] });
                    } else {
                        res.render('sport_seance', {'title': 'liste de vos séances', 'results' : [], 'message': message, "user_info": results[0] })
                    }
                })
            });
        });
    });
}); //fin POST /seance

app.post('/newSeance', (req,res)=>{
    // console.log(req.body) 
    let time = req.body.time;
    let date = req.body.date;
    let id = req.body.id;
    let idActivite = req.body.id_activite_physique;
    let myqueryAdd = `INSERT INTO seance (time, date, id_user, id_activite) VALUES (?,?,?,?)`;
    // console.log(myqueryAdd);
    con.connect((err) => {
        if (err) throw err;
        con.query(myqueryAdd, [time, date, id, idActivite ], (err,results) => {
            // console.log(results);
            if (err) throw err;
            let myquery = "SELECT user.id_user, user.avatar, user.user_pseudo, type, image, time, DATE_FORMAT(date, '%W %e %M %Y') AS date FROM seance " ;
            myquery += "INNER JOIN activite_physique ON activite_physique.id_activite_physique = seance.id_activite " ;
            myquery += "INNER JOIN user ON user.id_user = seance.id_user " ;
            myquery += `WHERE user.id_user=${id} `            
            myquery += "ORDER BY DATE_FORMAT(date, '%Y%c') ";
            con.connect((err)=>{
                if (err) throw err;
                con.query(myquery, (err,results)=>{
                    if (err) throw err;
                    // console.log(results)
                    res.render('sport_seance', {'title': 'liste de vos séances', 'results' : results})
                })
            })
        })
    })
})

app.get('/activity', (req,res)=>{
    let myquery = "SELECT * FROM activite_physique ";
    con.connect((err)=>{
        if (err) throw err;
        con.query(myquery, (err, results)=>{
            if (err) throw err;
            res.send(results)
        });
    });
});


/**
 * SERVEUR
 */
app.listen(PORT, HOST, () => {
    console.log(`Le serveur tourne sur http://${HOST}:${PORT}`);
});