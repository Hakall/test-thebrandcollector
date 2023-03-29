# Test The Brand Collector

## Comment il est construit ?
Il s'agit d'un projet NodeJs, qui utilise la librairie Fastify pour exposer une api REST.
J'ai profité de ce test pour essayer cette librairie dont j'avais plusieurs fois entendu parler.

Le dossier credentials contient le json de l'application Google afin d'accèder à l'API Google sheet, 
credentials contient également le token.json qui en temps normal ne devrait PAS être accessible dans le repository, malheureusement je n'ai pas eu le temps de trouvé une méthode afin de l'obtenir en ligne de commande (pour docker).
(le compte gmail utilisé a été créé pour ce test)

Les sources sont dans src/:
- config expose les variables d'environnement et utilise un petit utilitaire qui lève une exception si une variable est manquante, elles sont des dépendances de notre projet
- interfaces contient les classes permettant les accès simples aux apis (et éventuellement base de données s'il y en avait)
- services contient les classes contenant la logique métier de notre apis, elles utilisent les différentes interfaces
- models contient les définitions/schéma des objets métiers que l'on utilise
- routes définit les différentes point d'accès de notre api REST, j'ai séparé les routes protégées des routes ouvertes.
- utils contient les fonctions utilitaires du projet (ici l'utilitaire pour les variables d'environnement)
### Protection des appels anonymes

Pour empêcher les appels anonymes j'ai mis en place une simple authentification Bearer, il faut récpérer le jeton à l'aide le route /token et de la la clé api.

## Comment faire fonctionner le projet ?

Le projet utilise nodejs 16.14.2 (même si je pense qu'il peut fonctionner en version inférieure), afin d'éviter tout soucis d'environnement j'ai ajouté un fichier docker-compose.yml afin de déployer l'application sur n'importe quelle machine ayant Docker.

### Configuration
- Renommer le fichier .env.sample à la racine du projet en .env
- Mettre les bonne valeurs (cf mail)

### Déploiement
Avec npm (version 8.5.0) : `npm run deploy`

Avec docker-compose : `docker-compose up -d`

### Authentification
- Lors du premier lancement, avec node, si le fichier token.json n'est pas présent, une page de connexion Google devrait s'ouvrir dans votre navigateur préféré, accepter même si l'application n'est pas validée par Google 
- Récupérer le token jwt sur le route /token avec en queryParam la clé API (apiKey)

`curl --location --request GET 'localhost:3000/token?apiKey={API_KEY}'`

- Copier le token reçu, il sera envoyé avec le Header HTTP Authorization lors des prochaines requêtes


### Appels API
- Recherche des films Harry Potter : GET /omdb?search={REQUÊTE}

`curl --location --request GET 'localhost:3000/omdb?search=harry%20potter' \
--header 'Authorization: Bearer {token}'`

- Recherche des films Fast and Furious : GET /films

`curl --location --request GET 'localhost:3000/films' \
--header 'Authorization: Bearer {token}'`

- Recherche des films Pirates des Caraïbes et stockage dans le spreadsheet (https://docs.google.com/spreadsheets/d/1rHqGiW5lRkFgHLzgBPt58flG-crOZQlfj-LkGx-sUMg/edit?usp=sharing) : POST /pirates 

`curl --location --request POST 'localhost:3000/pirates' \
--header 'Authorization: Bearer {token}'`

## Comment tu envisages la partie hébergement ?
Comme il s'agit d'un projet simple n'ayant qu'une seule application node, je partirai pour un déploiement sur Heroku.
Le déploiement sera continu avec intégration à Github.

Si jamais on veut mettre en place les améliorations évoquées plus bas, il sera plus judicieux de mettre en place un cluster kubernetes où seront déployés l'api et la solution de cache choisie. 
On peut envisager un cluster hébergé sur le cloud, par exemple un cluster ECS sur AWS ou GKE sur GCP.

## Comment tu vois une éventuelle montée en charge du système ?
Dans l'état cela se passera mal, car même si on configure notre cloud afin de scaler notre application à la demande, et que notre application est effectivement scalable,
la limitation journalière de l'API OmDB sera bien trop vite atteinte. 
À moins de payer un accès à l'API OmDB, dans ce cas Heroku et les autres providers fournissent des stratégies de scaling que l'on configurera à notre sauce.
Il faudra malheureusement copier à la main le fichier token.json, le flow OAuth de google n'étant pas très souple...

## Ses forces, faiblesses, NEXT STEPS pour la mise en prod.
### Forces
- On récupère la liste complète des films correspondants à une requête, sans avoir à gérer la pagination.
- On peut savoir en une seule requête si le magnifique Paul Walker joue dans un film Pirates des Caraïbes

### Faiblesses
- Il est compliqué de filtrer les "vrais" films Star Wars, Fast furious et Pirates des Caraïbes
- Pour cette même raison impossible de dynamiquement récupérer le casting de Star Wars via OMDB, d'autant plus que le champ Actors est loin d'être exhaustif
- L'Id de la spreadsheet est en dépendance du projet
- L'authentification Google via le navigateur n'est pas très pratique car compliqué à mettre en oeuvre avec le déploiement via Docker 
- La limite journalière de l'API Omdb
- Même sans la limite, on flood beaucoup l'API OMDB avec les même appels.

### Next Steps
- Créer un Dockerfile afin de déployer proprement notre container sur le Cloud (si jamais on utilise AWS ou GCP)
- Comme on effectue les mêmes appels OMDB API on pourrait imaginer de mettre en place un système de cache, in-memory si on s'en fiche de la scalabilité, ou via une solution comme Redis ou Memcached qui nous permettra d'être scalable, le cache sera déployé dans le même cluster que l'app (ou les apps, si on scale)
- Créer la spreadsheet dynamiquement
- Ajouter linter/prettier avec une configuration communautaire afin de respecter les standards 
- Ajouter des tests à notre application, on peut tester le mapper (BrandcollectorService.movieMapper) ou l'authentification, je ne pense pas qu'il soit nécessaire de tester les appels aux APIS tiers (à moins qu'elles soient sujettes à beaucoup de changement, ou peu fiables) 
- Ajouter un système de logs complet est lisible pour le monitoring
- Configurer correctement l'objet Reply de fastify afin d'avoir une API RESTFul solide (renommer les points d'entrée dans ce cas)
- Voir pour intégrer l'Oauth Google en ligne de commande pour ne pas avoir le fichier token.json en dépendance. (https://cloud.google.com/container-registry/docs/advanced-authentication?hl=fr)
