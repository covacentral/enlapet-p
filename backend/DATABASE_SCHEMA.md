# Enlapet 2.0: Arquitectura NoSQL Optimizada

Esta arquitectura está diseñada para erradicar el problema de lecturas infinitas (`N+1`) usando el patrón **Fan-Out on Write**.

## Colecciones Principales

### 1. `users`
Guarda el perfil del usuario humano.
```json
{
  "id": "uid",
  "name": "Daniel Robles",
  "profilePictureUrl": "https://...",
  "enlaPetPoints": 1500,
  "role": "user | vet",
  // Subcolecciones:
  // - /following/{userId}: Lista de gente a la que sigo.
  // - /followers/{userId}: Lista de gente que me sigue.
  // - /feed/{postId}: [CRÍTICO] Aquí se empujarán los posts de la gente que sigo.
  // - /engagements/summary: Resumen O(1) de posts guardados y likeados.
}
```

### 2. `pets`
Guarda el perfil de la mascota.
```json
{
  "id": "petId",
  "ownerId": "uid",
  "name": "Rex",
  "breed": "Golden Retriever",
  "petPictureUrl": "https://...",
  "rescueMode": {
    "isActive": false,
    "lastSeen": null
  }
}
```

### 3. `posts` (Denormalizado)
La colección global de posts. ¡Aquí está la magia de la denormalización! No hacemos joins.
```json
{
  "id": "postId",
  "authorId": "petId | uid",
  "authorType": "pet | user",
  "authorName": "Rex", // <-- DENORMALIZADO: Evita lecturas al perfil
  "authorAvatarUrl": "https://...", // <-- DENORMALIZADO
  "imageUrl": "https://...",
  "caption": "¡Día de parque!",
  "createdAt": "ISO_DATE",
  "likesCount": 0,
  "commentsCount": 0
}
```

## Flujo Crítico de Optimización (El Secreto del Fan-Out)

**¿Qué pasa cuando Rex publica una foto?**
1. Se guarda el documento completo en la colección global `posts`. (1 Escritura)
2. El Backend busca a todos los seguidores del dueño de Rex. (Ej: 100 seguidores = 1 Lectura pesada... pero solo pasa 1 vez).
3. **FAN-OUT:** El Backend escribe una copia ligera de ese Post dentro de `users/{follower_id}/feed/{postId}`. (100 Escrituras baratas).

**¿Qué pasa cuando un seguidor abre la App y va al Inicio?**
1. El Backend pide: `db.collection('users').doc(follower_id).collection('feed').orderBy('createdAt', 'desc').limit(10)`.
2. **Costo Final:** Exactamente 10 LECTURAS. No importa si sigues a 1 millón de personas. El feed ya está construido para ti. Esto es O(1) en términos de eficiencia para el lector.

Esta es la arquitectura final que usaremos en las siguientes fases del desarrollo.
