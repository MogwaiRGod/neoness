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
    host: "172.17.0.3", /* A VERIFIER */
    user : "pedrolove", /* A MODIFIER */
    password: "ThePassword", /* A MODIFIER */
    database: DB,
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

// route test
app.get('/', (req, res) => {
    res.send("Route fonctionnelle");
});

// route vers le dashboard admin
app.get('/admin', (req, res) => {
    // requête pour récupérer les données de tous les utilisateurs
    let queryAllUsers = "SELECT user_pseudo AS Pseudo, name AS Nom, prenom AS Prénom, tel AS Téléphone, taille AS Taille, poids AS Poids, objectif AS Objectif, pass AS MDP FROM user;";
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
})


/**
 * SERVEUR
 */
app.listen(PORT, HOST, () => {
    console.log(`Le serveur tourne sur http://${HOST}:${PORT}`);
});