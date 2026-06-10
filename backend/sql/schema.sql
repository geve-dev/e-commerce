-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema ecommerce
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema ecommerce
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `ecommerce` ;

-- -----------------------------------------------------
-- Table `ecommerce`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'mod', 'adm') NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ecommerce`.`purchase`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`purchase` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_user` INT NOT NULL,
  `datahora` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `all_price` DECIMAL(15,2) NULL DEFAULT NULL,
  `status` ENUM('aberto', 'fechado', 'cancelado') NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_compras_users_idx` (`id_user` ASC) VISIBLE,
  CONSTRAINT `fk_compras_users`
    FOREIGN KEY (`id_user`)
    REFERENCES `ecommerce`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ecommerce`.`stores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`stores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_owner` INT NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `niche` VARCHAR(60) NULL DEFAULT NULL,
  `status` ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug` (`slug` ASC) VISIBLE,
  INDEX `id_owner` (`id_owner` ASC) VISIBLE,
  CONSTRAINT `stores_ibfk_1`
    FOREIGN KEY (`id_owner`)
    REFERENCES `ecommerce`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 11
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ecommerce`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_store` INT NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_products_stores_idx` (`id_store` ASC) VISIBLE,
  CONSTRAINT `fk_products_stores`
    FOREIGN KEY (`id_store`)
    REFERENCES `ecommerce`.`stores` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `ecommerce`.`items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`items` (
  `id_purchase` INT NOT NULL,
  `id_product` INT NOT NULL,
  `quantity` FLOAT NOT NULL,
  `unit_value` DECIMAL(15,2) NULL DEFAULT NULL,
  INDEX `fk_itens_compras_idx` (`id_purchase` ASC) VISIBLE,
  INDEX `fk_itens_products_idx` (`id_product` ASC) VISIBLE,
  CONSTRAINT `fk_itens_compras`
    FOREIGN KEY (`id_purchase`)
    REFERENCES `ecommerce`.`purchase` (`id`),
  CONSTRAINT `fk_itens_products`
    FOREIGN KEY (`id_product`)
    REFERENCES `ecommerce`.`products` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
