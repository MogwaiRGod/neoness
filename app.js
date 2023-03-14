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
const DB = ""; /* A REMPLIR */
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

// connexion test à la BDD
con.connect((err) => {
    if (err) throw err;
    console.log(`Connecté à la BDD ${DB}`);
});


/**
 * ROUTES
 */

// route d'accueil'
app.get('/', (req, res) => {
    // comment vérifier si un utilisateur est loggé ?
    res.redirect('/login');
});

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

app.post('/signin', (req,res) => {
    console.log(req.body);
    let name = req.body.name;
    let prenom = req.body.prenom;
    let tel = req.body.tel;
    let poids = req.body.poids;
    let taille = req.body.taille;
    let objectif = req.body.objectif;
    let pseudo = req.body.pseudo;
    let pass = req.body.pass;
    let avatar = req.body.avatar;

    // on vérifie que le pseudo demandé n'est pas déjà attribué
    let checkUser = "SELECT user_pseudo FROM user WHERE user_pseudo = ?";
    con.connect((err) => {
        if (err) throw err;

        con.query(checkUser, [pseudo], (err, results) => {
            if (err) throw err;

            // si la requête n'a pas retourné de résultat
            if (!results.length){
                let userStorage = {
                    'username': pseudo,
                    'rights': results[0].autorisation
                }
                // on peut ++ l'utilisateur à la BDD
                // let myquery = 'ALTER TABLE user AUTO_INCREMENT = MAX(id_user) ;' 
                let myquery = "INSERT INTO user (name, prenom, tel, poids, taille, objectif, pass, user_pseudo, avatar) VALUES (?,?,?,?,?,?,?,?,?) "
                con.connect((err)=>{
                    if (err) throw err;
                    con.query(myquery, [name, prenom, tel, poids, taille, objectif, pass, pseudo, avatar], (err,results) => {
                        let queryUser = "SELECT * FROM user WHERE user_pseudo = ? AND pass = ?;";
                        con.query(queryUser, [pseudo, pass], (err, results) => {
                           // console.log(results[0])
                            res.render('welcome', { 'title': 'Accueil', 
                                'message': `Welcome ${prenom}`,
                                'storage': userStorage,
                                'results': results[0]
                            });
                        });
                    });
                }); 
            }
            // sinon, on envoie un message d'erreur
            else {
                res.render('sport_login', {'title': 'Sign In', 'message': 'Inscription', 'erreur': "Pseudo déjà attribué" })
            }
        }); // fin con.query

    }); // fin con.connect


})


app.get('/login', (req,res) => {
    res.render("sport_login", {'title': 'Log In', 'message': 'Veuillez entrer vos identifiants afin de vous connecter', 'erreur':""})
})



app.post('/confirm', (req,res) => {
    console.log(req.body);
    let pseudo = req.body.pseudo;
    let pass = req.body.pass;
    let myquery = "SELECT * FROM user WHERE user_pseudo = ? AND pass = ?;";
    con.connect(function(err){
        if (err) throw err;
        con.query(myquery, [pseudo, pass], function(err,results){
            if (err) throw err;
            if(results.length){
                // on va enregistrer l'utilisateur dans le cache local
                let userStorage = {
                    'username': pseudo,
                    'rights': results[0].autorisation
                }
                // on évalue le statut de l'utilisateur
                if (results[0].autorisation == 'admin'){
                    // si c'est un admin, on le redirige vers le dashboard admin
                    res.redirect('/admin');
                }
                // on supprime la clef "autorisation" car l'utilisateur n'a pas besoin de connaître ses droits dans la BDD
                delete results[0].autorisation;
                // sinon, vers la page du compte utilisateur
                res.render('welcome', { 'title': 'Accueil', 
                    'message': `Welcome ${results[0].prenom}`,
                    'storage': userStorage,
                    'results': results[0]
                });
            } else {
                res.render('sport_login' , { 'title' : 'Login', 'message': "Connexion", 'erreur' : 'Identifiant incorrect'})
            }
        });
    });
});


// route recevant les données utilisateur à mettre à jour
app.post('/update', (req, res) => {
    console.log(req.body);
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
    
    con.connect((err)=>{
        if (err) throw err;
        // on envoie la requête de mise à jour
        con.query(queryUpd, (err,results)=>{
            if (err) throw err;

            let queryUser = "SELECT * FROM user WHERE id_user = ?;";
            // une fois la màj effectuée dans la BDD
            con.query(queryUser, [id], (err, results) => {
                // on réaffiche la page avec les résultats mis à jour
                res.render('welcome', { 'title': 'Accueil', 
                    'message': `Welcome ${prenom}`,
                    'storage': '',
                    'results': results[0]
                });
            })
        });
    });
}); // fin POST /update

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
});


/**
 * SERVEUR
 */
app.listen(PORT, HOST, () => {
    console.log(`Le serveur tourne sur http://${HOST}:${PORT}`);
});
