# TextLearn
- [What is TextLearn?](#what-is-textlearn)
- [Node e NPM](#node-e-npm)
- [Docker e Docker Compose](#docker-e-docker-compose)
- [Pipeline di pubblicazione](#pipeline-di-pubblicazione)
- [Creazione di una Branch e Sincronizzazione con il Master](#creazione-di-una-branch-e-sincronizzazione-con-il-master)
- [Struttura dei Commit](#struttura-dei-commit)

## What is TextLearn?
TextLearn è una piattaforma di apprendimento per chiunque voglia apprendere senza dover vedere ora e ore di video.

## Node e NPM
Per avviare il progetto c'è presente lo script "dev":
```
npm run dev
```
non so se funziona il db cosi, sicuramente lo fa con docker-compose.

## Docker e Docker Compose
Per creare l'immagine dell'appplicazione:
```
sudo docker build -t text-learn-app .
```
Per avviarla:
```
sudo docker-compose up
```
Docker si basa su molte dinamiche di caching per creare l'immagine.
Può essere necessario rimuoverla e ricrearla.
Per rimuovere tutti le possibili immagini cachate:
```
sudo docker system prune
```

Alcuni comandi utili:
```
docker-compose up --build
```
ricostruisce e avvia i container.

```
docker-compose down -v
docker volume prune
```
il primo comando ferma ed elimina tutti i volumi e container.
il secondo comando rimuove tutti i volumi rimasti non utilizzati.

## Pipeline di pubblicazione 
Come primo passo contollare in quale branch ci si trova con 
``` 
git status 
``` 
per cambiare il branch in qui ci si trova 
``` 
git checkout <nome-branch> 
``` 
per rendere i propri cambiamenti pronti per il commit con 
``` 
git add -A 
``` 
per fare il commit 
``` 
git commit -m "[prog-prot][<commit_type>]: <description_off_the_change>" 
``` 
per poi fare il push con  
``` 
git push origin <nome-branch> 
```
## Creazione di una Branch e Sincronizzazione con il Master
1. _Creazione_ di una nuova Branch:
   Per lavorare su una nuova funzionalità o risolvere un problema, è consigliato creare una nuova branch.
   Utilizzare il seguente comando per crearne una nuova:
   ```
   git checkout -b <nome-branch>
   ```
Sostituire `<nome-branch>` con un nome descrittivo per la nuova branch.

2. _Sincronizzazione_ con il Branch Main:
   È importante mantenere la propria branch aggiornata con le ultime modifiche dal branch master.
   Utilizzare i seguenti comandi:
   ```
   git checkout main
   git pull origin main
   git checkout <nome-branch>
   git merge main
   ```
Questo assicura che la propria branch sia allineata con le ultime modifiche nel branch master.

3. _Creare una Pull Request_ (PR):
   Quando si è pronti a incorporare le proprie modifiche nel branch master, è necessario creare una Pull Request.
   Seguire questi passaggi:

    - Assicurarsi di aver committato tutte le modifiche nella propria branch.
    - Accedere alla piattaforma di hosting del repository (ad esempio GitHub).
    - Selezionare la propria branch e avviare la creazione di una nuova Pull Request verso il branch master.
    - Fornire una descrizione dettagliata delle modifiche apportate.
## Struttura dei Commit
Per mantenere la storia del progetto pulita e facilmente comprensibile, è importante seguire una struttura standard per i commit. 
Seguire queste linee guida:

- **Sintassi del Commit Message:**
La forma generica è
  ```
  [<commit_type>]: <description_off_the_change>
  ```
Ogni messaggio di commit dovrebbe essere chiaro e descrittivo. Utilizzare una sintassi verbosa e specifica.
Ad esempio:
  ```
  [ADD]: Aggiunta della funzionalità X
  [FIX]: Correzione del bug Y
  [IMP]: Miglioramento delle prestazioni di Z
  ```

- **Atomicità dei Commit:**
  Cerca di mantenere i commit atomici, cioè con una singola funzionalità o correzione per commit.
  Questo rende più semplice la gestione delle modifiche e il roll-back se necessario.
  Per ogni singola funzionalità si crea un commit poi il push può essere fatto alla fine.
