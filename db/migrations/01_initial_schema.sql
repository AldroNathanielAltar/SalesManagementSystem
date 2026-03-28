-- ============================================================
-- FILE   : 01_initial_schema.sql
-- PURPOSE: Create all 6 HopeDB tables + seed data
-- ============================================================

-- Create employee table 
CREATE TABLE employee (
  empno VARCHAR(5) NOT NULL PRIMARY KEY, 
  lastname VARCHAR(15),  
  firstname VARCHAR(15), 
  gender CHAR(1) CONSTRAINT gender_ck CHECK (gender in ('M','F')), 
  birthdate DATE, 
  hiredate DATE, 
  sepDate DATE
);

INSERT INTO employee VALUES('00001','Smith', 'John', 'M','1985-02-20','2010-05-11', NULL);
INSERT INTO employee VALUES('00003','Smith', 'Jane', 'F','1990-05-16','2010-05-11', NULL);
INSERT INTO employee VALUES('00005','King', 'Don', 'M','1986-02-14','2010-06-23', NULL);
INSERT INTO employee VALUES('00007','Jenskin', 'Floyd', 'M','1990-02-20','2010-05-30', NULL);
INSERT INTO employee VALUES('00009','Cerudo', 'Bambie', 'F','1983-06-23','2010-05-30', NULL);
INSERT INTO employee VALUES('00011','Davis', 'Tom', 'M','1989-12-16','2010-06-30', NULL);
INSERT INTO employee VALUES('00013','Morris', 'Olive', 'F','1991-07-21','2010-06-30', NULL);
INSERT INTO employee VALUES('00015','Zulueta', 'Maggie', 'F','1990-08-03','2010-07-05', '2011-03-30');
INSERT INTO employee VALUES('00017','Celestino', 'Nelia', 'F','1984-10-24','2010-07-05', NULL);
INSERT INTO employee VALUES('00019','Esperanza', 'Nehemiah', 'M','1982-02-21','2010-07-05', '2014-04-28');
INSERT INTO employee VALUES('00021','Manchester', 'Chelie', 'F','1988-12-07','2010-07-05', NULL);
INSERT INTO employee VALUES('00023','Kline', 'Nicholas', 'M','1992-01-21','2010-07-05', '2010-12-23');
INSERT INTO employee VALUES('00025','Macapagal', 'Ivy', 'F','1992-04-30','2010-07-05', NULL);
INSERT INTO employee VALUES('00027','Blanche', 'Ernest', 'M','1986-12-21','2010-07-05', NULL);
INSERT INTO employee VALUES('00029','Chua', 'Evangeline', 'F','1989-03-10','2010-07-05', NULL);
INSERT INTO employee VALUES('00031','Lancaster', 'Greta', 'F','1987-08-17','2010-07-05', NULL);
INSERT INTO employee VALUES('00033','Parks', 'Nigel', 'M','1993-06-23','2010-07-05', NULL);
INSERT INTO employee VALUES('00035','Carlston', 'Voltaire', 'F','1985-06-12','2010-07-21', NULL);
INSERT INTO employee VALUES('00037','Silva', 'Yves', 'M','1988-09-21','2010-07-21', NULL);
INSERT INTO employee VALUES('00039','Geisert', 'William', 'M','1980-03-03','2010-07-21', NULL);
INSERT INTO employee VALUES('00041','Darwin', 'Helena', 'F','1978-11-08','2010-09-01', NULL);
INSERT INTO employee VALUES('00043','Love', 'Queen', 'F','1983-11-29','2010-09-01', NULL);
INSERT INTO employee VALUES('00045','Raven', 'Danny', 'M','1984-02-15','2010-12-03', NULL);
INSERT INTO employee VALUES('00047','Devito', 'Clint', 'M','1981-06-07','2010-12-03', NULL);
INSERT INTO employee VALUES('00049','Irving', 'Nancy', 'F','1987-09-19','2010-12-03', NULL);
INSERT INTO employee VALUES('00051','Baltimore', 'Fergie', 'F','1986-10-10','2011-01-05', NULL);
INSERT INTO employee VALUES('00053','Jones', 'Veronica', 'F','1983-05-01','2011-01-05', '2011-03-30');
INSERT INTO employee VALUES('00055','Travis', 'Ursula', 'F','1987-06-07','2011-01-05', NULL);
INSERT INTO employee VALUES('00057','Orleans', 'Sylvia', 'F','1987-01-28','2011-01-05', NULL);
INSERT INTO employee VALUES('00059','Sy', 'Alice', 'F','1984-08-13','2011-01-05', '2011-04-20');
INSERT INTO employee VALUES('00061','De Leon', 'Girlie', 'F','1983-07-27','2011-01-05', NULL);
INSERT INTO employee VALUES('00063','Grant', 'Albert', 'M','1979-05-05','2011-01-05', NULL);

-- Create customer table
CREATE TABLE customer (
  custno VARCHAR(5) NOT NULL PRIMARY KEY, 
  custname VARCHAR(20), 
  address VARCHAR(50), 
  payterm VARCHAR(3) CONSTRAINT pay_ck CHECK (payterm IN ('COD', '30D', '45D'))
);

INSERT INTO customer VALUES('C0001','Globus Medical, Inc', '2560 Gen Armistead Ave Audubon CA 94031', '30D');
INSERT INTO customer VALUES('C0002','RF Industries, Inc', '7610 Miramar Rd San Diego, CA 92602', '45D');
INSERT INTO customer VALUES('C0003','Trisha Macdowell', '7642 Clairemont Mesa Blvd San Diego CA 90321', 'COD');
INSERT INTO customer VALUES('C0004','HMS Holdings, Inc', '1000 So Fremont Ave, Suite 225 Alhambara CA 91303', '45D');
INSERT INTO customer VALUES('C0005','Christian Andersen', '1120 Lincoln St Suite 809 Sacramento CA 95815', 'COD');
INSERT INTO customer VALUES('C0006','Astronics, Inc', '2 Orion Aliso Viejo, CA 92656', '30D');
INSERT INTO customer VALUES('C0007','Morgan Alegore', '2 Goodyear Irvine, CA 92618', 'COD');
INSERT INTO customer VALUES('C0008','Abaxis, Inc', '3240 Whipple Rd, Union City, CA 94587', '30D');
INSERT INTO customer VALUES('C0009','Landec Corp.', '3603 Haven Avenue Menlo Park, CA 94025', '30D');
INSERT INTO customer VALUES('C0010','SMP Corp.', '3718 Northern Long Island NY 12528', '45D');
INSERT INTO customer VALUES('C0011','B&G Foods', '4 Gatehall Dr., Ste. 110 Parsippany, NJ 07054', '45D');
INSERT INTO customer VALUES('C0012','Dexter Santos', '2739 Rebeiro Ave, Santa Clara, CA 95051', 'COD');
INSERT INTO customer VALUES('C0013','Health Stream', '209 10th Ave, South Suite 450 Nashville Tennessee', '45D');
INSERT INTO customer VALUES('C0014','InSync Training LLC', 'P.O. Box 3122 Roanoke, VA 24015', '30D');
INSERT INTO customer VALUES('C0015','Bespoke Education', '8205 Santa Monica Blvd, Suite 365 W HWood CA 90046', '30D');
INSERT INTO customer VALUES('C0016','Peri Solutions', '2880 Zanker Road San Jose CA 95101', '30D');
INSERT INTO customer VALUES('C0017','Janet Lim', '800 N. State College Blvd. Fullerton, CA 92831', 'COD');
INSERT INTO customer VALUES('C0018','Nicole Hutchison', '200 Lincoln Ave, Salinas, CA 93901', 'COD');
INSERT INTO customer VALUES('C0019','Brandon Drucker', '65 West Alisal St., # 101, Salinas, CA 93901', 'COD');
INSERT INTO customer VALUES('C0020','Eugene Whitaker', '45 Fremont Street, Suite 2000 San Frans, CA 9410', 'COD');
INSERT INTO customer VALUES('C0021','Touch Suite', '1081 Holland Dr. Boca Raton, FL 33487', '30D');
INSERT INTO customer VALUES('C0022','CallFire', '1410 2nd St., Suite 200 Santa Monica, CA 90401', '45D');
INSERT INTO customer VALUES('C0023','ISBX Corp', '3415 S. Sepulveda Blvd. 1250 Los Angeles, CA 90034', '30D');
INSERT INTO customer VALUES('C0024','Factual', '1999 Avenue of the Stars Los Angeles, CA 90067', '30D');
INSERT INTO customer VALUES('C0025','Predixion', '31910 Del Obispo San Juan Capistrano, CA 92675', '45D');
INSERT INTO customer VALUES('C0026','Datapop', '5762 W Jefferson Blvd, Los Angeles, CA 90016', '45D');
INSERT INTO customer VALUES('C0027','SA Photonics, Inc', '130 Knowles Dr, Los Gatos, CA 95032', '30D');
INSERT INTO customer VALUES('C0028','Acumen Bldg Entp', '7770 Pardee Lane, Ste. 200 Oakland, CA 94621', '30D');
INSERT INTO customer VALUES('C0029','IMCorp', '50 Utopia Road Manchester, CT 06042', '30D');
INSERT INTO customer VALUES('C0030','Brady and Assoc.', '3710 Ruffin Rd, San Diego, CA 90401', '30D');
INSERT INTO customer VALUES('C0031','Yello Hammer LLC', '111 W 28th St, New York, NY 10001', '30D');
INSERT INTO customer VALUES('C0032','Conductor', '2 Park Ave, New York, NY 10016', '30D');
INSERT INTO customer VALUES('C0033','Quantum Networks', '323 West 39th Street 11th Flr NY 10018', '45D');
INSERT INTO customer VALUES('C0034','Refinery29', '225 Broadway NY 10007', '45D');
INSERT INTO customer VALUES('C0035','Gravity Media', '104 W 27th St #11d NY 10001', '30D');
INSERT INTO customer VALUES('C0036','Regal wings', '244 Fifth Avenue, Suite 200 New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0037','33Across', '229 W 28th St, New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0038','RCS Capital', '405 Park Avenue New York, NY 1002', '30D');
INSERT INTO customer VALUES('C0039','OnDeck', '1400 Broadway, 25th Floor, New York, NY 10001', '45D');
INSERT INTO customer VALUES('C0040','Optimatic Media, Inc', '54 West 40th St., 7th Floor, New York, NY 10018', '30D');
INSERT INTO customer VALUES('C0041','James Underwood', '450 West 33rd Street New York, NY 10018', 'COD');
INSERT INTO customer VALUES('C0042','Charles Silverstone', '1335 Ave of the Americas, New York, NY 10019', 'COD');
INSERT INTO customer VALUES('C0043','Nea Sanchez', '371 7th Ave, New York, NY 10001', 'COD');
INSERT INTO customer VALUES('C0044','Tracy Lambert', '234 W 42nd St, New York, NY 10036', 'COD');
INSERT INTO customer VALUES('C0045','Peter Charlestone', '342 W 40th St, New York, NY 10018', 'COD');
INSERT INTO customer VALUES('C0046','Oxford Academy', '5172 Orange Ave, Cypress, CA 90630', '45D');
INSERT INTO customer VALUES('C0047','Whitney High Sch', '16800 Shoemaker Ave, Cerritos, CA 90703', '30D');
INSERT INTO customer VALUES('C0048','Pacfic Collegiate', '255 Swift St, Santa Cruz, CA 95060', '45D');
INSERT INTO customer VALUES('C0049','KIPP San Jose', '1790 Educational Park Dr, San Jose, CA 95133', '30D');
INSERT INTO customer VALUES('C0050','The Preuss School', '9500 Gilman Dr Mc 0536, La Jolla, CA 92093', '45D');
INSERT INTO customer VALUES('C0051','American Indian Sch', '3637 Magee Ave, Oakland, CA 94619', '30D');
INSERT INTO customer VALUES('C0052','Lowell High School', '1101 Eucalyptus Dr, San Francisco, CA 94132', '45D');
INSERT INTO customer VALUES('C0053','University HSchool', '2611 East Matoian M/S Uh134, Fresno, CA 93740', '30D');
INSERT INTO customer VALUES('C0054','Hawthorne Academy', '4467 West Broadway, Hawthorne, CA 90250', '30D');
INSERT INTO customer VALUES('C0055','Lennox Academy', '11036 Hawthorne Blvd, Lennox, CA 90304', '45D');
INSERT INTO customer VALUES('C0056','Manhasset School', '200 Memorial Place Manhasset, NY 11030', '45D');
INSERT INTO customer VALUES('C0057','Pittsford High Sch', '55 Sutherland St Pittsford, NY 14534', '30D');
INSERT INTO customer VALUES('C0058','Jericho High School', '99 Cedar Swamp Rd, Jericho, NY 11753', '45D');
INSERT INTO customer VALUES('C0059','Stuyvesant High', '345 Chambers St, New York, NY 10282', '45D');
INSERT INTO customer VALUES('C0060','Rye High School', 'Parsons St, Rye, NY 10580', '30D');
INSERT INTO customer VALUES('C0061','Brooklyn High', '29 Ft Greene Place, Brooklyn, NY 11217', '45D');
INSERT INTO customer VALUES('C0062','Brooklyn Latin Sch', '325 Bushwick Ave, Brooklyn, NY 11206', '30D');
INSERT INTO customer VALUES('C0063','Bronx Science High', '75 West 205Th St Bronx, NY 10468', '45D');
INSERT INTO customer VALUES('C0064','Staten Island High', '485 Clawson St, Staten Island, NY 10306', '30D');
INSERT INTO customer VALUES('C0065','Yonkers Middle High', '150 Rockland Ave, Yonkers, NY 10705', '45D');
INSERT INTO customer VALUES('C0066','Helen Strong', '800 S Main StTulelake, CA 96134', 'COD');
INSERT INTO customer VALUES('C0067','Gay Rose Silva', '575 3rd St Napa, CA 94559', 'COD');
INSERT INTO customer VALUES('C0068','William Pichler', '1121 L St #407 Sacramento, CA 95814', 'COD');
INSERT INTO customer VALUES('C0069','Terrance Nitz', '23200 Pacific Coast Hwy Malibu, CA 90265', 'COD');
INSERT INTO customer VALUES('C0070','Errol Atanacio', '300 Capitol Mall #555 Sacramento, CA 95814', 'COD');
INSERT INTO customer VALUES('C0071','Chuck Jones', '163 W 125th St New York, NY 10027', 'COD');
INSERT INTO customer VALUES('C0072','Menchu Palmores', '600 College Ave Montour Falls, NY 14865', 'COD');
INSERT INTO customer VALUES('C0073','Princess Ann White', '109 S Union St #411 Rochester, NY 14607', 'COD');
INSERT INTO customer VALUES('C0074','Florence Black', '450 S Salina St Syracuse, NY 13202', 'COD');
INSERT INTO customer VALUES('C0075','Jeremy Irons', '3357 US Highway 9w Highland, NY 12528', 'COD');
INSERT INTO customer VALUES('C0076','Braddy Banks', '1424 Fulton St Brooklyn, NY 11216', 'COD');
INSERT INTO customer VALUES('C0077','Office NY Tech Serv', 'State Capitol Empire State Plaza NY 10027', '45D');
INSERT INTO customer VALUES('C0078','FDA New York', '158-15 Liberty Ave., Jamaica, NY 12528', '45D');
INSERT INTO customer VALUES('C0079','Social Sec Admn NY', '123 William St, New York, NY 10038', '45D');
INSERT INTO customer VALUES('C0080','Social Sec Admn CA', '3836 Wilshire Blvd, Los Angeles, CA 90010', '45D');
INSERT INTO customer VALUES('C0081','Dept Food and Agri', '220 N Street Sacramento, CA 95814', '45D');
INSERT INTO customer VALUES('C0082','California Dept Tech', '1325 J St Suite 1600 Sacramento CA 95814', '45D');

-- Create product table
CREATE TABLE product (
  prodCode VARCHAR(6) NOT NULL PRIMARY KEY, 
  description VARCHAR(30), 
  unit VARCHAR(3) CONSTRAINT unit_ck CHECK (unit IN ('pc','ea','mtr','pkg','ltr'))
);

INSERT INTO product VALUES('AD0001','Toshiba Canvio 1 TB', 'ea');
INSERT INTO product VALUES('AD0002','WD Ultra 1TB ', 'ea');
INSERT INTO product VALUES('AD0003','Seagate Bracuda 1TB ', 'ea');
INSERT INTO product VALUES('AD0004','Transcend 1 TB ', 'ea');
INSERT INTO product VALUES('AK0001','HP Pavilion DV6000', 'pc');
INSERT INTO product VALUES('AK0002','Micro Innovations Kb', 'pc');
INSERT INTO product VALUES('AK0003','Steel APEX GAMING KB', 'pc');
INSERT INTO product VALUES('AM0001','MS Wireless Mouse', 'pc');
INSERT INTO product VALUES('AM0002','LOGITECH 910-002696', 'pc');
INSERT INTO product VALUES('AM0003','IMICRO KB-IM8911U', 'pc');
INSERT INTO product VALUES('AM0004','STEEL Rival Mouse', 'pc');
INSERT INTO product VALUES('AM0005','Logitech M500 USB', 'pc');
INSERT INTO product VALUES('AP0001','HDMI Pocket Proj', 'pc');
INSERT INTO product VALUES('AP0002','InFocus IN112 Proj', 'pc');
INSERT INTO product VALUES('AP0003','ViewSonic Projector', 'pc');
INSERT INTO product VALUES('MD0001','ASUS VS228H-P 22-In', 'ea');
INSERT INTO product VALUES('MD0002','ViewSonic VA2446M', 'ea');
INSERT INTO product VALUES('MD0003','Dell UltrShrp U2412M', 'ea');
INSERT INTO product VALUES('MD0004','Acer S231HL BBID 23', 'ea');
INSERT INTO product VALUES('MD0005','Apple Dsplay MC914', 'ea');
INSERT INTO product VALUES('MD0006','Asus VE228H 21.5', 'ea');
INSERT INTO product VALUES('MP0001','Apple iPhone 4 16GB ', 'ea');
INSERT INTO product VALUES('MP0002','Apple iPhone 3G', 'ea');
INSERT INTO product VALUES('MP0003','SAMSUNG GALAXY S4 ', 'ea');
INSERT INTO product VALUES('MP0004','SAMSUNG GALAXY S3', 'ea');
INSERT INTO product VALUES('NB0001','Dell Inspiron Laptop', 'ea');
INSERT INTO product VALUES('NB0002','ASUS Tformer Book', 'ea');
INSERT INTO product VALUES('NB0003','Acer C720 Chrome', 'ea');
INSERT INTO product VALUES('NB0004','HP Chromebook 11', 'ea');
INSERT INTO product VALUES('NB0005','Apple Mac Pro Laptop', 'ea');
INSERT INTO product VALUES('NH0001','NETGEAR ProSAFE 5-Port ', 'pc');
INSERT INTO product VALUES('NH0002','TP-LINK  1000Mbps', 'pc');
INSERT INTO product VALUES('NH0003','Cisco 24-P G Switch ', 'pc');
INSERT INTO product VALUES('NT0001','Apple iPad Retna 16G', 'ea');
INSERT INTO product VALUES('NT0002','Apple iPad 2 MC769LL', 'ea');
INSERT INTO product VALUES('NT0003','Apple iPad Mini ', 'ea');
INSERT INTO product VALUES('NT0004','Samsung Galaxy Tab3 ', 'ea');
INSERT INTO product VALUES('NT0005','Samsung Glaxy Tab32G', 'ea');
INSERT INTO product VALUES('NT0006','DrgonTouch 7B 2Core ', 'ea');
INSERT INTO product VALUES('PA0001','MS Ofc Business 2013', 'ea');
INSERT INTO product VALUES('PA0002','Office Mac Home 2011', 'ea');
INSERT INTO product VALUES('PC0001','CyberpowerPC Gamer', 'ea');
INSERT INTO product VALUES('PC0002','Dell 745 Opti Desk', 'ea');
INSERT INTO product VALUES('PC0003','Dell Inspiron Desk', 'ea');
INSERT INTO product VALUES('PC0004','Dell Inspiron 660', 'ea');
INSERT INTO product VALUES('PF0001','Win7 Pro SP1 64bit ', 'ea');
INSERT INTO product VALUES('PF0002','Win7 Home Pre SP1 64', 'ea');
INSERT INTO product VALUES('PF0003','Mac OS X ver 10.6.3', 'ea');
INSERT INTO product VALUES('PF0004','Windows 8.1 64-Bit ', 'ea');
INSERT INTO product VALUES('PF0005','Windows 8 Pro ', 'ea');
INSERT INTO product VALUES('PF0006','RED HAT Prof Edition', 'ea');
INSERT INTO product VALUES('PR0001','Epson Expression ', 'pc');
INSERT INTO product VALUES('PR0002','Canon PIXMA MX922 ', 'pc');
INSERT INTO product VALUES('PR0003','HP Envy 4500 Wireles', 'pc');
INSERT INTO product VALUES('PS0001','VirServ 12Core 128GB', 'pc');
INSERT INTO product VALUES('PS0002','Ms WinServer 2012', 'pc');
INSERT INTO product VALUES('PS0003','Cisco Virt Hardware', 'pc');

-- Create priceHist table
CREATE TABLE priceHist (
  effDate DATE NOT NULL, 
  prodCode VARCHAR(6) NOT NULL REFERENCES product, 
  unitPrice DECIMAL(10,2) CONSTRAINT unitP_ck CHECK (unitPrice > 0),  
  PRIMARY KEY (effDate, prodCode)
);

INSERT INTO priceHist VALUES('2010-05-15','AK0001', 12);
INSERT INTO priceHist VALUES('2010-05-15','AK0002', 8.37);
INSERT INTO priceHist VALUES('2010-05-15','AK0003', 99.99);
INSERT INTO priceHist VALUES('2010-05-15','AM0001', 36.45);
INSERT INTO priceHist VALUES('2010-05-15','AM0002', 69.26);
INSERT INTO priceHist VALUES('2010-05-15','AM0003', 20.43);
INSERT INTO priceHist VALUES('2010-05-15','AM0004', 88.14);
INSERT INTO priceHist VALUES('2010-05-15','AM0005', 49.27);
INSERT INTO priceHist VALUES('2010-05-15','AP0001', 299.99);
INSERT INTO priceHist VALUES('2010-05-15','AP0002', 304.48);
INSERT INTO priceHist VALUES('2010-05-15','AP0003', 349.99);
INSERT INTO priceHist VALUES('2010-05-15','MD0001', 119.68);
INSERT INTO priceHist VALUES('2010-05-15','MD0002', 149.99);
INSERT INTO priceHist VALUES('2010-05-15','MD0003', 239.96);
INSERT INTO priceHist VALUES('2010-05-15','MD0004', 132.21);
INSERT INTO priceHist VALUES('2010-05-15','MD0005', 825);
INSERT INTO priceHist VALUES('2010-05-15','MD0006', 124.29);
INSERT INTO priceHist VALUES('2010-05-15','NB0001', 300);
INSERT INTO priceHist VALUES('2010-05-15','NB0002', 298);
INSERT INTO priceHist VALUES('2010-05-15','NB0003', 199);
INSERT INTO priceHist VALUES('2010-05-15','NB0004', 279);
INSERT INTO priceHist VALUES('2010-05-15','PA0001', 219);
INSERT INTO priceHist VALUES('2010-05-15','PA0002', 102.99);
INSERT INTO priceHist VALUES('2010-07-12','PC0001', 454.54);
INSERT INTO priceHist VALUES('2010-05-15','PC0001', 499.99);
INSERT INTO priceHist VALUES('2010-07-12','PC0002', 197.99);
INSERT INTO priceHist VALUES('2010-05-15','PC0002', 179.99);
INSERT INTO priceHist VALUES('2010-05-15','PC0003', 390);
INSERT INTO priceHist VALUES('2010-05-15','PC0004', 538);
INSERT INTO priceHist VALUES('2010-05-15','PF0001', 123.75);
INSERT INTO priceHist VALUES('2010-05-15','PF0002', 64.25);
INSERT INTO priceHist VALUES('2010-05-15','PF0003', 28.87);
INSERT INTO priceHist VALUES('2010-05-15','PF0004', 92.85);
INSERT INTO priceHist VALUES('2010-05-15','PF0005', 119);
INSERT INTO priceHist VALUES('2010-05-15','PF0006', 7.5);
INSERT INTO priceHist VALUES('2010-05-15','PR0001', 81.72);
INSERT INTO priceHist VALUES('2010-05-15','PR0002', 99.99);
INSERT INTO priceHist VALUES('2010-05-15','PR0003', 123);
INSERT INTO priceHist VALUES('2010-08-01','MD0001', 131.65);
INSERT INTO priceHist VALUES('2010-08-01','MD0002', 164.99);
INSERT INTO priceHist VALUES('2010-08-01','MD0003', 263.96);
INSERT INTO priceHist VALUES('2010-08-01','MD0004', 145.43);
INSERT INTO priceHist VALUES('2010-08-01','MD0005', 907.5);
INSERT INTO priceHist VALUES('2010-08-01','MD0006', 136.72);
INSERT INTO priceHist VALUES('2010-08-16','PF0001', 112.5);
INSERT INTO priceHist VALUES('2010-08-16','PF0002', 58.41);
INSERT INTO priceHist VALUES('2010-08-16','PF0003', 26.25);
INSERT INTO priceHist VALUES('2010-08-16','PF0004', 84.41);
INSERT INTO priceHist VALUES('2010-08-16','PF0005', 108.18);
INSERT INTO priceHist VALUES('2010-08-16','PF0006', 6.82);
INSERT INTO priceHist VALUES('2010-08-16','AM0001', 38.27);
INSERT INTO priceHist VALUES('2010-08-16','AM0002', 72.72);
INSERT INTO priceHist VALUES('2010-08-16','AM0003', 21.45);
INSERT INTO priceHist VALUES('2010-08-16','AM0004', 92.55);
INSERT INTO priceHist VALUES('2010-08-16','AM0005', 51.73);
INSERT INTO priceHist VALUES('2010-08-16','AP0001', 314.99);
INSERT INTO priceHist VALUES('2010-08-16','AP0002', 319.7);
INSERT INTO priceHist VALUES('2010-08-16','AP0003', 367.49);
INSERT INTO priceHist VALUES('2010-08-16','AD0001', 58);
INSERT INTO priceHist VALUES('2010-08-16','AD0002', 69.99);
INSERT INTO priceHist VALUES('2010-08-16','AD0003', 54.44);
INSERT INTO priceHist VALUES('2010-08-16','AD0004', 71.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0001', 21.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0002', 24.99);
INSERT INTO priceHist VALUES('2010-08-16','NH0003', 171.69);
INSERT INTO priceHist VALUES('2010-12-01','NT0001', 412.49);
INSERT INTO priceHist VALUES('2010-12-01','NT0002', 324.99);
INSERT INTO priceHist VALUES('2010-12-01','NT0003', 287);
INSERT INTO priceHist VALUES('2010-12-01','NT0004', 219.89);
INSERT INTO priceHist VALUES('2010-12-01','NT0005', 499.99);
INSERT INTO priceHist VALUES('2010-12-01','NT0006', 57.99);
INSERT INTO priceHist VALUES('2010-12-01','PS0001', 3200);
INSERT INTO priceHist VALUES('2010-12-01','PS0002', 699.99);
INSERT INTO priceHist VALUES('2010-12-01','PS0003', 599.99);
INSERT INTO priceHist VALUES('2010-12-01','MP0001', 199.95);
INSERT INTO priceHist VALUES('2010-12-01','MP0002', 126.72);
INSERT INTO priceHist VALUES('2010-12-01','MP0003', 425);
INSERT INTO priceHist VALUES('2010-12-01','MP0004', 302);
INSERT INTO priceHist VALUES('2011-02-01','NB0005', 1184.72);

-- Create sales table
CREATE TABLE sales (
  transNo VARCHAR(8) NOT NULL PRIMARY KEY, 
  salesDate DATE, 
  custNo VARCHAR(5), 
  empNo VARCHAR(5),
  record_status VARCHAR(10) DEFAULT 'ACTIVE',
  stamp TEXT,
  FOREIGN KEY (custNo) REFERENCES customer, 
  FOREIGN KEY (empNo) REFERENCES employee
);

-- Create salesDetail table
CREATE TABLE salesDetail (
  transNo VARCHAR(8) NOT NULL REFERENCES sales, 
  prodCode VARCHAR(6) NOT NULL REFERENCES product, 
  quantity DECIMAL(10,2) CONSTRAINT quantity_ck CHECK (quantity >= 0.0),
  record_status VARCHAR(10) DEFAULT 'ACTIVE',
  stamp TEXT,
  PRIMARY KEY (transNo, prodCode)
);
