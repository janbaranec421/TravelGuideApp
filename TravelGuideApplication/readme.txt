Aplik�cia je umiestnen� na : 	https://homel.vsb.cz/~bar0273/TravelGuideApplication/


Aplik�cia s�ahuje pomocou bezplatn�ch RESTful API  vektorov� geod�ta, d�ta optimalizovan�ch tr�s a d�ta o predpovedi po�asia.
Pre pou�itie t�chto slu�ieb je nutn� si rezervova� svoj vlastn� kl��.

Pre vektorov� geod�ta, forward & backward geocoding a vyh�ad�vanie tr�s sa vyu��va spolo�n� kl��, ktor� je mo�n� z�ska� z   https://mapzen.com/
Pre predpove� po�asia sa pou��va kl��, ktor� je mo�n� z�ska� z https://openweathermap.org/
Jednotliv� kl��e sta�� potom prep�sa� v MainPage.ts, ktor� oba druhy kl��ov uchov�va ako statick� premenn�.

Pre zistenie u��vate�ovej polohy je v prehliada�i Chrome 50+ (a v mnoh�ch ostatn�ch) nutn� taktie� pou��va� pre komunik�ciu HTTPS.
Tento probl�my s� eliminovan� pou�it�m skriptu "proxy.php" a pre spr�vny beh aplik�cie nieje potreba ho �alej modifikova�.

�trukt�ra a obsah prie�inkov aplik�cie

   - "CSS" : obsahuje .css s�bor pre �t�lovanie obsahu aplik�cie
   - "Packages" : obsahuje bal��ky potrebn� pre chod aplik�cie 
   - "Resources": obsahuje .png a JSON s�bory pou�it� aplik�ciou
   - "Resources/fonts" - obsahuje dodato�n� fonty pou��t� aplik�ciou
   - "Resources/Projects" - obsahuje JSON s�bor popisuj�ci zoznam v�etk�ch projektov, rovnako ako aj  JSON s�bory projektov samotn�ch
   - "Scripts": obsahuje komponenty a kni�nice tret�ch str�n (ES6 Promise, jQuery, Slick carousel)
   - "TS": obsahuje v�etky typescript komponenty implementovan� pre aplik�ciu
   - "index.html": domovsk� str�nka aplik�cie
   - "readme.txt": tento textov� s�bor
   - "proxy.php": PHP skript, ktor� ma za �lohu s�ahova� obsah z HTTP do HTTPS dom�n akou je t� na�a

�trukt�ra a obsah projektov
     project.json - s�bor obsahuj�ci zoznam v�etk�ch vytvoren�ch projektov
     project-"x".json - s�bor s d�tami projektu, pri�om "x" predstavuje celo��seln� ID projektu
     
�trukt�ra projektu:
   - n�zov
   - popis
   - zoznam �t�tkov pou��van�ch v projekte
   - zoznam miest  pou��van�ch v projekte (miesto zvy�ajne obsahuje �t�tky)
   - kolekcie t�chto miest miest
   - rozvrhy skladaj�ce sa z miest a  tie� �asov vyhraden�ch pre n�v�tevu