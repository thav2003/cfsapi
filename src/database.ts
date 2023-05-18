import { MongoClient, Db, Collection } from 'mongodb';
import logger from './logger';
import DBConfig from 'config/mongodb';
/**
 * All the methods and properties mentioned in the following class is
 * specific to MongoDB. You should make necessary changes to support
 * the database you want to use.
 */

class Database {
  private password: string;

  private user: string;

  private host: string;

  private dbName: string;

  private dbClient: MongoClient;

  private databaseInstance: Db;

  constructor() {
    this.password = DBConfig.PWD;
    this.user = DBConfig.USER;
    this.host = DBConfig.HOST;
    this.dbName = DBConfig.DB_NAME;
  }

  public async connect(): Promise<void> {
    if (this.dbClient) {
      logger.debug('Connection already exists');
      return;
    }

    const connectionString = this.getConnectionString();
    logger.debug(`Database connection string: ${connectionString}`);

    const client = new MongoClient(connectionString, DBConfig.OPTIONS);
    this.dbClient = await client.connect();
    logger.server('Connected with database host');
    
    this.databaseInstance = this.dbClient.db(this.dbName);
  }

  public async disconnect() {
    if (this.isDbConnected()) {
      logger.server(`Disconnected from ${this.host}/${this.dbName}`);
      await this.dbClient.close();
    }
  }


  /**
   * For MongoDB there is no table. It is called collection
   * If you are using SQL database then this should be something like getTable()
   *
   * @param name MongoDB Collection name
   */
  public getCollection(name: string): Collection {
    if (!this.databaseInstance) {
      throw new Error('Database not initialized');
    }

    return this.databaseInstance.collection(name);
  }

  /**
   * Build database connection string.
   * Customize as needed for your database.
   */
  private getConnectionString() {
    if (process.env.NODE_ENV === 'development') {
      this.dbName += '_test';
    }
    if (this.user && this.password) {
      return `mongodb+srv://${this.user}:${this.password}@${this.host}/${this.dbName}?retryWrites=true&w=majority`;
    }
    
    return `mongodb://${this.host}/${this.dbName}?retryWrites=true&w=majority`;
  }

  public getDbHost() {
    return this.host;
  }

  public getDbPassword() {
    return this.password;
  }

  public getDbUser() {
    return this.user;
  }

  public getDbName() {
    return this.dbName;
  }

  //   public isDbConnected() {
  //     return this.dbClient && this.dbClient.isConnected();
  //   }
  
  public async isDbConnected() {
    if (!this.databaseInstance) {
      return false;
    }

    let res;

    try {
      res = await this.databaseInstance.admin().ping();
    } catch (err) {
      return false;
    }
    return Object.prototype.hasOwnProperty.call(res, 'ok') && res.ok === 1;
  }
}

const db = new Database();

export default db;