# Firebase dashboard structure

Collections utilisées par le dashboard :

- `users/{uid}`
  - profil applicatif
  - champs clés : `role`, `clientId`, `clientIds`, `mustChangePassword`, `isActive`
- `clients/{clientId}`
  - société/source de vérité métier
  - champs clés : `name`, `primaryContactName`, `primaryContactEmail`, `billingEmail`
- `projects/{projectId}`
  - projet rattaché à un client
  - champs clés : `clientId`, `status`, `progress`, `kickoff`, `delivery`, `milestones`
- `projectUpdates/{updateId}`
  - feed chronologique visible côté client
  - champs clés : `clientId`, `projectId`, `title`, `body`, `authorName`, `date`
- `tickets/{ticketId}`
  - support / demandes
  - champs clés : `clientId`, `project`, `status`, `priority`, `messages`
- `invoices/{invoiceId}`
  - facturation
  - champs clés : `clientId`, `project`, `number`, `amount`, `status`, `issued`, `due`, `pdfUrl`

Conventions retenues :

- tout document métier porte `clientId` pour simplifier les règles Firestore
- les comptes Firebase Auth restent séparés des profils applicatifs dans `users`
- l’admin bootstrap est l’UID `kVurSY6zZMYaDI2xZJ3a4JydJFG2`
- le mot de passe temporaire est géré via `mustChangePassword: true`
- les projets gardent les `milestones` embarqués pour conserver l’ordre et éviter une micro-collection inutile
- les tickets gardent le thread dans `messages` tant que le volume reste modéré ; si le support grossit, migrer vers une sous-collection `tickets/{id}/messages`

Checklist Firebase côté console :

1. activer `Authentication > Email/Password`
2. déployer `firebase/firestore.rules`
3. créer ou connecter ton compte admin Firebase Auth correspondant à l’UID bootstrap
4. te connecter une première fois avec ce compte pour générer son profil `users/{uid}`
5. créer ensuite les `clients`, puis les `accounts`, puis les `projects` depuis le dashboard admin
