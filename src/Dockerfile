# --------- BUILDER ---------
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia o pom.xml e baixa dependências para cache
COPY pom.xml .
RUN mvn -q dependency:go-offline

# Copia o código e compila o projeto
COPY src ./src
RUN mvn -q package -DskipTests

# --------- RUNTIME ---------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia o JAR construído
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
