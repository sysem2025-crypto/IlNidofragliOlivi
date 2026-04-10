# Nido fra gli Olivi

Prima base statica per un progetto web dedicato a un B&B con due obiettivi:

- presentare la struttura in modo elegante e chiaro;
- offrire una piccola area amministrativa per registrare ospiti, seguire pratiche ISTAT e calcolare la tassa di soggiorno.

## Cosa include

- homepage vetrina con sezione servizi e workflow;
- area amministrativa con accesso demo tramite PIN locale;
- modulo per inserimento ospiti;
- dashboard con metriche di riepilogo;
- archivio soggiorni e stato pratiche;
- persistenza locale tramite `localStorage`.

## Come aprirlo

Non servono dipendenze o build tool.

1. Apri `index.html` in un browser.
2. Vai alla sezione "Area amministrativa".
3. Usa il PIN demo `1234`.

## Nota importante

Questa versione è una demo operativa front-end. Non invia davvero dati a ISTAT, al portale alloggiati o al comune.

Il passo successivo consigliato è trasformarla in una web app con:

- autenticazione reale;
- database;
- ruoli utenti;
- esportazioni o integrazioni verso i portali ufficiali;
- storico, filtri e report mensili.
