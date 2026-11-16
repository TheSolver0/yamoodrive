# YAMOO DRIVE React

Démonstration front-end premium du site YAMOO DRIVE, réalisée avec React et Vite.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite l’adresse indiquée par Vite.

## Construire la version de production

```bash
npm run build
npm run preview
```

## Pages

- `/` vitrine et réservation
- `/admin` portail de démonstration de l’équipe

La vitrine comprend une hero cinématographique, un récit au scroll, un showroom photographique interactif et des parcours guidés de réservation et de visite. Le portail regroupe les commandes, l’agenda mois/semaine/jour, les chauffeurs, les clients, la flotte et la maintenance.

## Important

Le projet est entièrement front-end. Les demandes, les commandes et les modifications de l’espace équipe sont enregistrées dans `localStorage`. Pour une mise en production réelle, il faudra connecter une API, une base de données et une authentification.

Les photographies intégrées sont des références des modèles. Les véhicules exacts et leur disponibilité doivent être confirmés par YAMOO DRIVE.

## Ressources immersives

La visite actuelle est une exploration photographique chargée à la demande. Elle propose un déplacement limité dans les zones réellement photographiées, le zoom souris/tactile, deux positions disponibles pour le Jetour T2, des points d’intérêt et un klaxon synthétisé dans le navigateur.

La photographie principale du Jetour T2 est attribuée à Milhouse35 et distribuée sous licence CC BY-SA 4.0. Le détail des sources, licences et références non intégrées se trouve dans `public/assets/media-sources.json`.

Aucun panorama équirectangulaire fidèle n’est fourni : l’interface ne simule donc pas une couverture 360°. Pour une exploration réellement sphérique, il faudra fournir des panoramas autorisés et validés par YAMOO DRIVE.
