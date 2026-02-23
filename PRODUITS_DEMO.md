# Produits de Démonstration

## Problème
Les produits ne s'affichent pas sur la page d'accueil car il n'y a pas de données dans Firebase.

## Solution Temporaire
Utiliser des produits de démonstration en local jusqu'à ce que Firebase soit configuré avec de vraies données.

## Modification du Store

Le `productsStore.ts` a été modifié pour retourner des produits de démonstration si Firebase n'est pas configuré ou si aucun produit n'est trouvé.

### Produits de Démonstration Inclus

1. **Smartphone Samsung Galaxy**
   - Prix: 150,000 FCFA
   - Catégorie: Électronique
   - Rating: 4.5

2. **Ordinateur Portable HP**
   - Prix: 350,000 FCFA
   - Catégorie: Électronique
   - Rating: 4.7

3. **Chaussures Nike Air**
   - Prix: 45,000 FCFA
   - Catégorie: Mode
   - Rating: 4.3

4. **Sac à Dos Eastpak**
   - Prix: 25,000 FCFA
   - Catégorie: Accessoires
   - Rating: 4.6

5. **Montre Casio**
   - Prix: 35,000 FCFA
   - Catégorie: Accessoires
   - Rating: 4.4

6. **Écouteurs Sony**
   - Prix: 15,000 FCFA
   - Catégorie: Électronique
   - Rating: 4.2

## Pour Ajouter de Vrais Produits

1. Configurez Firebase avec de vraies clés dans `.env`
2. Utilisez le dashboard fournisseur pour ajouter des produits
3. Les produits de démonstration seront automatiquement remplacés

## Images
Les images utilisent des placeholders de https://via.placeholder.com
Pour de vraies images, uploadez-les sur Firebase Storage.
