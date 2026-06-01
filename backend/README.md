Booking backend (Spring Boot) — initial files

Files added:
- `src/main/resources/db/migration/V1__create_booking_schema.sql` — Flyway migration creating `courts`, `time_slots`, and `bookings` tables.
- `src/main/resources/db/migration/V2__seed_courts.sql` — seed sample courts.

Next steps:
1. Scaffold a Spring Boot project (Maven or Gradle). Configure `spring.flyway.locations=classpath:db/migration`.
2. Add dependencies: `spring-boot-starter-data-jpa`, `spring-boot-starter-web`, `org.postgresql:postgresql`, `org.flywaydb:flyway-core`.
3. Implement JPA entities and transactional booking logic using the migrations above.

Default choices used:
- Build tool: Maven (changeable on request)
- Migration tool: Flyway
- PK strategy: `BIGSERIAL` numeric IDs
