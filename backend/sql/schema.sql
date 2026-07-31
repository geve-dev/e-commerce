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
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4;


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
  INDEX `fk_compras_users_id` USING BTREE (`id_user`) VISIBLE,
  CONSTRAINT `fk_compras_users`
    FOREIGN KEY (`id_user`)
    REFERENCES `ecommerce`.`users` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 23
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `ecommerce`.`stores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`stores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_owner` INT NOT NULL,
  `store_name` VARCHAR(120) NOT NULL,
  `niche` VARCHAR(60) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(255) NULL DEFAULT NULL,
  `banner` VARCHAR(255) NULL DEFAULT NULL,
  `contact_email` VARCHAR(100) NOT NULL,
  `contact_phone` VARCHAR(15) NOT NULL,
  `cnpj` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `status` ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug` (`slug` ASC) VISIBLE,
  INDEX `id_owner` (`id_owner` ASC) VISIBLE,
  CONSTRAINT `stores_ibfk_1`
    FOREIGN KEY (`id_owner`)
    REFERENCES `ecommerce`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `ecommerce`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `price` DECIMAL(10,2) NULL DEFAULT NULL,
  `stock` INT NULL DEFAULT NULL,
  `image` VARCHAR(255) NULL DEFAULT NULL,
  `id_store` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_products_stores` (`id_store` ASC) VISIBLE,
  CONSTRAINT `fk_products_stores`
    FOREIGN KEY (`id_store`)
    REFERENCES `ecommerce`.`stores` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 19
DEFAULT CHARACTER SET = utf8mb4;


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
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `ecommerce`.`payment_methods`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`payment_methods` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NULL DEFAULT '1',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `slug` (`slug` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `ecommerce`.`payments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `payment_method_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'approved', 'failed', 'refunded') NULL DEFAULT 'pending',
  `gateway_id` VARCHAR(255) NULL DEFAULT NULL,
  `invoice_url` VARCHAR(255) NULL DEFAULT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `payment_method_id` (`payment_method_id` ASC) VISIBLE,
  CONSTRAINT `payments_ibfk_1`
    FOREIGN KEY (`payment_method_id`)
    REFERENCES `ecommerce`.`payment_methods` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `ecommerce`.`user_addresses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecommerce`.`user_addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `cep` VARCHAR(20) NOT NULL,
  `neighborhood` VARCHAR(100) NOT NULL,
  `street` VARCHAR(255) NOT NULL,
  `number` VARCHAR(45) NOT NULL,
  `complement` VARCHAR(100) NULL DEFAULT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `address_name` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_user_addresses_users_id` USING BTREE (`user_id`) VISIBLE,
  CONSTRAINT `user_addresses_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `ecommerce`.`users` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 10
DEFAULT CHARACTER SET = utf8mb4;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
