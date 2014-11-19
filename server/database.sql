create database findMe;

use findMe;

create table users (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        phoneNum varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        updated_at varchar(255) NOT NULL
        );

create table credentials (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        phoneNum varchar(255) NOT NULL,
        `to` varchar(255) NOT NULL,
        accountSid varchar(255) NOT NULL,
        authToken varchar(255) NOT NULL,
        updated_at varchar(255) NOT NULL
        );

