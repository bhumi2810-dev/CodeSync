FROM openjdk:17-alpine
WORKDIR /app
RUN adduser -D appuser
USER appuser
CMD ["sh", "-c", "javac Main.java && java Main"]
