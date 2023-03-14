-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: sport
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activite_physique`
--

DROP TABLE IF EXISTS `activite_physique`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activite_physique` (
  `id_activite_physique` int unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(200) NOT NULL,
  `image` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_activite_physique`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activite_physique`
--

LOCK TABLES `activite_physique` WRITE;
/*!40000 ALTER TABLE `activite_physique` DISABLE KEYS */;
INSERT INTO `activite_physique` VALUES (1,'tennis','https://cdn-icons-png.flaticon.com/128/10/10575.png'),(2,'foot','https://cdn-icons-png.flaticon.com/512/27/27127.png'),(3,'course de fond','https://cdn-icons-png.flaticon.com/128/3018/3018580.png'),(4,'natation','https://cdn-icons-png.flaticon.com/512/47/47743.png'),(5,'combat','https://cdn-icons-png.flaticon.com/128/37/37457.png'),(6,'musculation','https://cdn-icons-png.flaticon.com/512/185/185590.png'),(7,'gymnastique','https://cdn-icons-png.flaticon.com/512/94/94171.png'),(8,'badminton','https://cdn-icons-png.flaticon.com/512/10/10566.png'),(9,'aviron','https://cdn-icons-png.flaticon.com/512/38/38607.png');
/*!40000 ALTER TABLE `activite_physique` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seance`
--

DROP TABLE IF EXISTS `seance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seance` (
  `id_seance` int unsigned NOT NULL AUTO_INCREMENT,
  `time` int unsigned NOT NULL,
  `id_activite` int unsigned NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id_seance`),
  KEY `id_activite` (`id_activite`),
  CONSTRAINT `id_activite` FOREIGN KEY (`id_activite`) REFERENCES `activite_physique` (`id_activite_physique`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seance`
--

LOCK TABLES `seance` WRITE;
/*!40000 ALTER TABLE `seance` DISABLE KEYS */;
INSERT INTO `seance` VALUES (1,25,2,'2023-03-13');
/*!40000 ALTER TABLE `seance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `tel` varchar(20) NOT NULL,
  `poids` decimal(5,2) unsigned NOT NULL,
  `taille` decimal(3,2) unsigned NOT NULL,
  `objectif` int unsigned NOT NULL,
  `pass` varchar(255) NOT NULL,
  `id_seance` int unsigned DEFAULT NULL,
  `user_pseudo` varchar(45) NOT NULL,
  `autorisation` set('user','admin') DEFAULT 'user',
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  KEY `id_seance_idx` (`id_seance`),
  CONSTRAINT `id_seance` FOREIGN KEY (`id_seance`) REFERENCES `seance` (`id_seance`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'ben','micka','55.55.55.55.55',65.00,1.74,60,'azerty',1,'killard','user','https://www.automobile-sportive.com/guide/peugeot/307cc/307cc-ouverture.jpg'),(2,'rob','diane','44.44.44.44.44',55.50,1.70,50,'qwerty',NULL,'mogwai','admin','https://images.rtl.fr/~c/770v513/rtl/www/1520158-le-personnage-gizmo-image-d-illustration.jpg'),(3,'c','c','122',75.25,1.20,44,'c',NULL,'c','user','https://cdn-icons-png.flaticon.com/128/1077/1077114.png');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-14  9:04:48
