import { injectable  } from 'inversify';
import { createClient, createCluster   } from 'redis';
import logger from './logger';
export type RedisClient = ReturnType<typeof createClient>;
export type RedisCluster = ReturnType<typeof createCluster>;
import { SetOptions } from 'redis';
import RedisConfig from 'config/redis';


export interface IRedisClient {
  set:(key:string, value:any, expirationSeconds:number)=>Promise<void>;
  get:(key:string)=>Promise<any>;
  remove: (key: string) => Promise<void>;
  getClient:()=>RedisClient;
  connect:()=>Promise<void>;
  disconnect:()=>Promise<void>;
  getList:(listName: string)=>Promise<any[]>
  addToListAsync:(listName: string, value:any)=>Promise<void>;
  removeElementFromList(listName: string, value: any): Promise<void>;
}

@injectable()
export class Redis implements IRedisClient {
  private client: RedisClient;

  // private cluster:RedisCluster;

  private getAsync: (key: string) => Promise<any | null>;

  private setAsync: (key: string, value: any, options?: SetOptions) => Promise<void>;

  private delAsync: (key: string) => Promise<void>;

  private pushAsync: (key: string, value: any) => Promise<void>;

  private removeAsync: (key: string, count:number, value: any) => Promise<void>;

  private getListAsync:(key: string, start:number, end:number)=> Promise<any[]>;

  constructor() {
    // this.cluster = createCluster({
    //   rootNodes:RedisConfig.ROOTNODES,
    //   useReplicas:false,
    // });
    

    this.client = createClient(
      {
        url:`redis://${RedisConfig.DB_HOST}:${RedisConfig.DB_PORT}`,
        disableOfflineQueue:RedisConfig.DOQ,
      },
    );
    this.getAsync = this.client.get.bind(this.client);
    this.setAsync = this.client.set.bind(this.client);
    this.delAsync = this.client.del.bind(this.client);
    this.pushAsync = this.client.rPush.bind(this.client);
    this.removeAsync = this.client.lRem.bind(this.client);
    this.getListAsync = this.client.lRange.bind(this.client);
    this.client.on('error', (err) => {
      console.log('Redis error:', err);
    });
    // this.cluster.on('error', (err) => {
    //   console.log('Redis Cluster Error', err);
    // });
  }

  public async connect(): Promise<void> {
    await this.client.connect();
    // await this.cluster.connect();
    // // test cluster
    // await this.cluster.set('key', 'value');
    // const value = await this.cluster.get('key');
    // console.log(value);
    
    await this.client.flushAll();
    logger.info('Connected with redis');
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    // await this.cluster.disconnect();
    logger.info(`Disconnected from redis://${RedisConfig.DB_HOST}:${RedisConfig.DB_PORT}`);
  }

  public getClient() {
    return this.client;
  }

  public async getList(listName: string):Promise<any[]> {
    const data = await this.getListAsync(listName, 0, -1);
    return data.reduce((result, value) => {
      try {
        const obj = JSON.parse(value);
        result = result.concat(obj);
      } catch (error) {
        console.error(`Failed to parse value "${value}":`, error);
      }
      return result;
    }, []);
  }

  public async removeElementFromList(listName: string, value: any): Promise<void> {
    await this.removeAsync(listName, 0, JSON.stringify(value));
  }

  public async addToListAsync(listName: string, value: any) :Promise<void> {
    await this.pushAsync(listName, JSON.stringify(value)); 
  }

  public async set(key: string, value: any, expirationSeconds: number): Promise<void> {
    const exists = await this.client.exists(key);
    if (exists) {
      await this.setAsync(key, JSON.stringify(value), { EX: expirationSeconds, XX: true });
    } else {
      await this.setAsync(key, JSON.stringify(value), { EX: expirationSeconds, NX: true });
    }
  }
    
   

  public async get(key: string): Promise<any> {
    const data = await this.getAsync(key);
    if (data === null) {
      return null;
    }
    return JSON.parse(data);
  }

  public async remove(key: string): Promise<void> {
    await this.delAsync(key);
  }
  
}