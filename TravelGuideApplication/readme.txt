Aplikácia je umiestnená na : 	https://homel.vsb.cz/~bar0273/TravelGuideApplication/


Aplikácia sahuje pomocou bezplatnıch RESTful API  vektorové geodáta, dáta optimalizovanıch trás a dáta o predpovedi poèasia.
Pre pouitie tıchto sluieb je nutné si rezervova svoj vlastnı klúè.

Pre vektorové geodáta, forward & backward geocoding a vyh¾adávanie trás sa vyuíva spoloènı klúè, ktorı je moné získa z   https://mapzen.com/
Pre predpoveï poèasia sa pouíva klúè, ktorı je moné získa z https://openweathermap.org/
Jednotlivé klúèe staèí potom prepísa v MainPage.ts, ktorá oba druhy klúèov uchováva ako statické premenné.

Pre zistenie uívate¾ovej polohy je v prehliadaèi Chrome 50+ (a v mnohıch ostatnıch) nutné taktie pouíva pre komunikáciu HTTPS.
Tento problémy sú eliminované pouitím skriptu "proxy.php" a pre správny beh aplikácie nieje potreba ho ïalej modifikova.

Štruktúra a obsah prieèinkov aplikácie

   - "CSS" : obsahuje .css súbor pre štılovanie obsahu aplikácie
   - "Packages" : obsahuje balíèky potrebné pre chod aplikácie 
   - "Resources": obsahuje .png a JSON súbory pouité aplikáciou
   - "Resources/fonts" - obsahuje dodatoèné fonty pouíté aplikáciou
   - "Resources/Projects" - obsahuje JSON súbor popisujúci zoznam všetkıch projektov, rovnako ako aj  JSON súbory projektov samotnıch
   - "Scripts": obsahuje komponenty a kninice tretích strán (ES6 Promise, jQuery, Slick carousel)
   - "TS": obsahuje všetky typescript komponenty implementované pre aplikáciu
   - "index.html": domovská stránka aplikácie
   - "readme.txt": tento textovı súbor
   - "proxy.php": PHP skript, ktorı ma za úlohu sahova obsah z HTTP do HTTPS domén akou je tá naša

Štruktúra a obsah projektov
     project.json - súbor obsahujúci zoznam všetkıch vytvorenıch projektov
     project-"x".json - súbor s dátami projektu, prièom "x" predstavuje celoèíselné ID projektu
     
Štruktúra projektu:
   - názov
   - popis
   - zoznam štítkov pouívanıch v projekte
   - zoznam miest  pouívanıch v projekte (miesto zvyèajne obsahuje štítky)
   - kolekcie tıchto miest miest
   - rozvrhy skladajúce sa z miest a  tie èasov vyhradenıch pre návštevu