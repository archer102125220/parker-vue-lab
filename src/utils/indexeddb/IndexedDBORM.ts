/**
 * IndexedDB ORM Utility
 * A lightweight, promise-based ORM-like utility for IndexedDB operations
 * Supports both Sequelize-style and chainable API
 */

// Type definitions
export interface AttributeConfig {
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  primaryKey?: boolean;
  autoIncrement?: boolean;
  allowNull?: boolean;
  unique?: boolean;
  defaultValue?: unknown | (() => unknown);
}

export interface IndexConfig {
  fields: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface ModelOptions {
  indexes?: IndexConfig[];
}

export interface ORMOptions {
  version?: number;
}

export interface WhereCondition {
  $eq?: unknown;
  $ne?: unknown;
  $gt?: unknown;
  $gte?: unknown;
  $lt?: unknown;
  $lte?: unknown;
  $in?: unknown[];
  $nin?: unknown[];
  $or?: Record<string, unknown>[];
}

export interface FindOptions {
  where?: Record<string, unknown | WhereCondition>;
  order?: [string, 'ASC' | 'DESC'][];
  limit?: number;
  offset?: number;
  include?: string[];
  transaction?: TransactionProxy;
}

export interface CreateOptions {
  transaction?: TransactionProxy;
}

interface QueryCondition {
  field: string;
  operator: string;
  value: unknown;
}

// Custom error classes
export class IndexedDBError extends Error {
  originalError: DOMException | null;

  constructor(message: string, originalError: DOMException | null = null) {
    super(message);
    this.name = 'IndexedDBError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Model instance class
 */
export class ModelInstance {
  _model: Model;
  [key: string]: unknown;

  constructor(model: Model, data: Record<string, unknown>) {
    this._model = model;
    Object.assign(this, data);
  }

  async save(): Promise<ModelInstance> {
    await this._model.orm._initDatabase();

    const db = this._model.orm.db!;
    const tx = db.transaction([this._model.storeName], 'readwrite');
    const store = tx.objectStore(this._model.storeName);

    const data: Record<string, unknown> = { ...this };
    delete data._model;

    return new Promise((resolve, reject) => {
      const request = store.put(data);

      request.onsuccess = () => resolve(this);
      request.onerror = () =>
        reject(new IndexedDBError('Failed to save record', request.error));
    });
  }

  async reload(): Promise<ModelInstance> {
    const primaryKey = this._model._getPrimaryKey();
    const id = this[primaryKey];
    const fresh = await this._model.findByPk(id);

    if (fresh) {
      Object.assign(this, fresh);
    }

    return this;
  }

  async destroy(): Promise<void> {
    await this._model.orm._initDatabase();

    const db = this._model.orm.db!;
    const tx = db.transaction([this._model.storeName], 'readwrite');
    const store = tx.objectStore(this._model.storeName);

    const primaryKey = this._model._getPrimaryKey();
    const id = this[primaryKey] as IDBValidKey;

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new IndexedDBError('Failed to delete record', request.error));
    });
  }
}

/**
 * Where clause builder for chainable API
 */
class WhereClause {
  private queryBuilder: QueryBuilder;
  private field: string;

  constructor(queryBuilder: QueryBuilder, field: string) {
    this.queryBuilder = queryBuilder;
    this.field = field;
  }

  equals(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'equals',
      value
    });
    return this.queryBuilder;
  }

  notEqual(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'notEqual',
      value
    });
    return this.queryBuilder;
  }

  above(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'above',
      value
    });
    return this.queryBuilder;
  }

  aboveOrEqual(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'aboveOrEqual',
      value
    });
    return this.queryBuilder;
  }

  below(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'below',
      value
    });
    return this.queryBuilder;
  }

  belowOrEqual(value: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'belowOrEqual',
      value
    });
    return this.queryBuilder;
  }

  between(lower: unknown, upper: unknown): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'between',
      value: [lower, upper]
    });
    return this.queryBuilder;
  }

  anyOf(values: unknown[]): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'anyOf',
      value: values
    });
    return this.queryBuilder;
  }

  noneOf(values: unknown[]): QueryBuilder {
    this.queryBuilder.whereConditions.push({
      field: this.field,
      operator: 'noneOf',
      value: values
    });
    return this.queryBuilder;
  }
}

/**
 * Query Builder for chainable API
 */
class QueryBuilder {
  private model: Model;
  whereConditions: QueryCondition[] = [];
  private orderByField: string | null = null;
  private orderDirection: 'ASC' | 'DESC' = 'ASC';
  private limitValue: number | null = null;
  private offsetValue: number | null = null;

  constructor(model: Model) {
    this.model = model;
  }

  where(field: string): WhereClause {
    return new WhereClause(this, field);
  }

  and(field: string): WhereClause {
    return new WhereClause(this, field);
  }

  orderBy(field: string): QueryBuilder {
    this.orderByField = field;
    this.orderDirection = 'ASC';
    return this;
  }

  reverse(): QueryBuilder {
    this.orderDirection = this.orderDirection === 'ASC' ? 'DESC' : 'ASC';
    return this;
  }

  limit(value: number): QueryBuilder {
    this.limitValue = value;
    return this;
  }

  offset(value: number): QueryBuilder {
    this.offsetValue = value;
    return this;
  }

  async toArray(): Promise<ModelInstance[]> {
    const options: FindOptions = {};

    if (this.whereConditions.length > 0) {
      options.where = {};
      for (const condition of this.whereConditions) {
        if (condition.operator === 'equals') {
          options.where[condition.field] = condition.value;
        } else if (condition.operator === 'above') {
          options.where[condition.field] = { $gt: condition.value };
        } else if (condition.operator === 'aboveOrEqual') {
          options.where[condition.field] = { $gte: condition.value };
        } else if (condition.operator === 'below') {
          options.where[condition.field] = { $lt: condition.value };
        } else if (condition.operator === 'belowOrEqual') {
          options.where[condition.field] = { $lte: condition.value };
        } else if (condition.operator === 'between') {
          const [lower, upper] = condition.value as [unknown, unknown];
          options.where[condition.field] = { $gte: lower, $lte: upper };
        } else if (condition.operator === 'anyOf') {
          options.where[condition.field] = { $in: condition.value as unknown[] };
        } else if (condition.operator === 'noneOf') {
          options.where[condition.field] = { $nin: condition.value as unknown[] };
        } else if (condition.operator === 'notEqual') {
          options.where[condition.field] = { $ne: condition.value };
        }
      }
    }

    if (this.orderByField) {
      options.order = [[this.orderByField, this.orderDirection]];
    }

    if (this.limitValue !== null) {
      options.limit = this.limitValue;
    }
    if (this.offsetValue !== null) {
      options.offset = this.offsetValue;
    }

    return this.model.findAll(options);
  }

  async first(): Promise<ModelInstance | null> {
    this.limitValue = 1;
    const results = await this.toArray();
    return results.length > 0 ? results[0] : null;
  }

  async last(): Promise<ModelInstance | null> {
    const results = await this.toArray();
    return results.length > 0 ? results[results.length - 1] : null;
  }

  async count(): Promise<number> {
    const results = await this.toArray();
    return results.length;
  }

  async delete(): Promise<number> {
    const records = await this.toArray();
    let count = 0;

    for (const record of records) {
      await record.destroy();
      count++;
    }

    return count;
  }

  async modify(data: Record<string, unknown>): Promise<number> {
    const records = await this.toArray();
    let count = 0;

    for (const record of records) {
      Object.assign(record, data);
      await record.save();
      count++;
    }

    return count;
  }
}

/**
 * Model transaction proxy
 */
class ModelTransactionProxy {
  private model: Model;
  private transactionProxy: TransactionProxy;

  constructor(model: Model, transactionProxy: TransactionProxy) {
    this.model = model;
    this.transactionProxy = transactionProxy;
  }

  async create(data: Record<string, unknown>): Promise<ModelInstance> {
    return this.model.create(data, { transaction: this.transactionProxy });
  }
}

/**
 * Transaction proxy for Sequelize-style transactions
 */
class TransactionProxy {
  tx: IDBTransaction;
  orm: IndexedDBORM;
  [key: string]: unknown;

  constructor(tx: IDBTransaction, orm: IndexedDBORM) {
    this.tx = tx;
    this.orm = orm;

    for (const [storeName, model] of orm.models.entries()) {
      this[storeName] = new ModelTransactionProxy(model, this);
    }
  }
}

/**
 * Model class representing a database table/store
 */
export class Model {
  orm: IndexedDBORM;
  storeName: string;
  attributes: Record<string, AttributeConfig>;
  options: ModelOptions;
  associations: {
    hasMany: { model: Model; foreignKey?: string; as?: string }[];
    belongsTo: { model: Model; foreignKey?: string; as?: string }[];
  };

  constructor(
    orm: IndexedDBORM,
    storeName: string,
    attributes: Record<string, AttributeConfig>,
    options: ModelOptions = {}
  ) {
    this.orm = orm;
    this.storeName = storeName;
    this.attributes = attributes;
    this.options = options;
    this.associations = {
      hasMany: [],
      belongsTo: []
    };
  }

  hasMany(targetModel: Model, options: { foreignKey?: string; as?: string } = {}): void {
    this.associations.hasMany.push({
      model: targetModel,
      foreignKey: options.foreignKey,
      as: options.as
    });

    if (options.as) {
      const methodName = `get${options.as.charAt(0).toUpperCase() + options.as.slice(1)}`;
      (this as unknown as Record<string, unknown>)[methodName] = async (instance: ModelInstance) => {
        const where: Record<string, unknown> = {};
        if (options.foreignKey) {
          where[options.foreignKey] = instance[this._getPrimaryKey()];
        }
        return targetModel.findAll({ where });
      };
    }
  }

  belongsTo(targetModel: Model, options: { foreignKey?: string; as?: string } = {}): void {
    this.associations.belongsTo.push({
      model: targetModel,
      foreignKey: options.foreignKey,
      as: options.as
    });

    if (options.as && options.foreignKey) {
      const methodName = `get${options.as.charAt(0).toUpperCase() + options.as.slice(1)}`;
      (this as unknown as Record<string, unknown>)[methodName] = async (instance: ModelInstance) => {
        const foreignKeyValue = instance[options.foreignKey!];
        return targetModel.findByPk(foreignKeyValue);
      };
    }
  }

  _getPrimaryKey(): string {
    const primaryKey = Object.entries(this.attributes).find(
      ([, config]) => config.primaryKey
    );
    return primaryKey ? primaryKey[0] : 'id';
  }

  private _applyDefaults(data: Record<string, unknown>): Record<string, unknown> {
    const result = { ...data };

    for (const [fieldName, config] of Object.entries(this.attributes)) {
      if (result[fieldName] === undefined && config.defaultValue !== undefined) {
        result[fieldName] =
          typeof config.defaultValue === 'function'
            ? (config.defaultValue as () => unknown)()
            : config.defaultValue;
      }
    }

    return result;
  }

  private _validate(data: Record<string, unknown>): void {
    for (const [fieldName, config] of Object.entries(this.attributes)) {
      const value = data[fieldName];

      if (config.allowNull === false && (value === null || value === undefined)) {
        throw new ValidationError(`Field '${fieldName}' cannot be null`);
      }

      if (value !== undefined && value !== null && config.type) {
        const expectedType = config.type.toLowerCase();
        const actualType = typeof value;

        if (expectedType === 'number' && actualType !== 'number') {
          throw new ValidationError(
            `Field '${fieldName}' must be a number, got ${actualType}`
          );
        }
        if (expectedType === 'string' && actualType !== 'string') {
          throw new ValidationError(
            `Field '${fieldName}' must be a string, got ${actualType}`
          );
        }
        if (expectedType === 'date' && !(value instanceof Date)) {
          throw new ValidationError(`Field '${fieldName}' must be a Date object`);
        }
      }
    }
  }

  private _matchesWhere(
    record: Record<string, unknown>,
    where: Record<string, unknown | WhereCondition>
  ): boolean {
    const whereObj = where as Record<string, unknown>;

    if (whereObj.$or) {
      return (whereObj.$or as Record<string, unknown>[]).some((condition) =>
        this._matchesWhere(record, condition)
      );
    }

    for (const [field, condition] of Object.entries(where)) {
      if (field.startsWith('$')) continue;

      const value = record[field];

      if (typeof condition !== 'object' || condition === null) {
        if (value !== condition) return false;
        continue;
      }

      const cond = condition as WhereCondition;
      if (cond.$eq !== undefined && value !== cond.$eq) return false;
      if (cond.$ne !== undefined && value === cond.$ne) return false;
      if (cond.$gt !== undefined && !((value as number) > (cond.$gt as number))) return false;
      if (cond.$gte !== undefined && !((value as number) >= (cond.$gte as number))) return false;
      if (cond.$lt !== undefined && !((value as number) < (cond.$lt as number))) return false;
      if (cond.$lte !== undefined && !((value as number) <= (cond.$lte as number))) return false;
      if (cond.$in !== undefined && !cond.$in.includes(value)) return false;
      if (cond.$nin !== undefined && cond.$nin.includes(value)) return false;
    }

    return true;
  }

  private async _loadAssociations(instance: ModelInstance, includes: string[]): Promise<void> {
    for (const includeName of includes) {
      const hasMany = this.associations.hasMany.find((a) => a.as === includeName);
      if (hasMany) {
        const methodName = `get${includeName.charAt(0).toUpperCase() + includeName.slice(1)}`;
        const method = (this as unknown as Record<string, (inst: ModelInstance) => Promise<ModelInstance[]>>)[methodName];
        if (method) {
          instance[includeName] = await method(instance);
        }
        continue;
      }

      const belongsTo = this.associations.belongsTo.find((a) => a.as === includeName);
      if (belongsTo) {
        const methodName = `get${includeName.charAt(0).toUpperCase() + includeName.slice(1)}`;
        const method = (this as unknown as Record<string, (inst: ModelInstance) => Promise<ModelInstance | null>>)[methodName];
        if (method) {
          instance[includeName] = await method(instance);
        }
      }
    }
  }

  async create(data: Record<string, unknown>, options: CreateOptions = {}): Promise<ModelInstance> {
    await this.orm._initDatabase();

    const recordData = this._applyDefaults(data);
    this._validate(recordData);

    const db = this.orm.db!;
    const tx = options.transaction
      ? options.transaction.tx
      : db.transaction([this.storeName], 'readwrite');
    const store = tx.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(recordData);

      request.onsuccess = () => {
        const createdRecord = { ...recordData };
        if (request.result !== undefined) {
          createdRecord[this._getPrimaryKey()] = request.result;
        }
        resolve(new ModelInstance(this, createdRecord));
      };

      request.onerror = () => {
        reject(new IndexedDBError('Failed to create record', request.error));
      };
    });
  }

  async findByPk(id: unknown, options: FindOptions = {}): Promise<ModelInstance | null> {
    await this.orm._initDatabase();

    const db = this.orm.db!;
    const tx = db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id as IDBValidKey);

      request.onsuccess = async () => {
        if (!request.result) {
          resolve(null);
          return;
        }

        const instance = new ModelInstance(this, request.result);

        if (options.include && Array.isArray(options.include)) {
          await this._loadAssociations(instance, options.include);
        }

        resolve(instance);
      };

      request.onerror = () => {
        reject(new IndexedDBError('Failed to find record', request.error));
      };
    });
  }

  async findOne(options: FindOptions = {}): Promise<ModelInstance | null> {
    const results = await this.findAll({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async findAll(options: FindOptions = {}): Promise<ModelInstance[]> {
    await this.orm._initDatabase();

    const db = this.orm.db!;
    const tx = db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const results: Record<string, unknown>[] = [];
      const request = store.openCursor();

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          const record = cursor.value;

          if (!options.where || this._matchesWhere(record, options.where)) {
            results.push(record);
          }

          cursor.continue();
        } else {
          if (options.order && Array.isArray(options.order)) {
            for (const [field, direction] of options.order) {
              results.sort((a, b) => {
                const aVal = a[field] as number | string;
                const bVal = b[field] as number | string;
                const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return direction === 'DESC' ? -comparison : comparison;
              });
            }
          }

          let finalResults = results;
          if (options.offset) {
            finalResults = finalResults.slice(options.offset);
          }
          if (options.limit) {
            finalResults = finalResults.slice(0, options.limit);
          }

          const instances = finalResults.map((r) => new ModelInstance(this, r));

          if (options.include && Array.isArray(options.include)) {
            for (const instance of instances) {
              await this._loadAssociations(instance, options.include);
            }
          }

          resolve(instances);
        }
      };

      request.onerror = () => {
        reject(new IndexedDBError('Failed to find records', request.error));
      };
    });
  }

  async update(data: Record<string, unknown>, options: FindOptions = {}): Promise<number> {
    const records = await this.findAll(options);
    let count = 0;

    for (const record of records) {
      Object.assign(record, data);
      await record.save();
      count++;
    }

    return count;
  }

  async destroy(options: FindOptions = {}): Promise<number> {
    const records = await this.findAll(options);
    let count = 0;

    for (const record of records) {
      await record.destroy();
      count++;
    }

    return count;
  }

  async bulkCreate(dataArray: Record<string, unknown>[]): Promise<ModelInstance[]> {
    const results: ModelInstance[] = [];
    for (const data of dataArray) {
      const record = await this.create(data);
      results.push(record);
    }
    return results;
  }

  // Chainable API methods
  async add(data: Record<string, unknown>): Promise<ModelInstance> {
    return this.create(data);
  }

  async get(id: unknown): Promise<ModelInstance | null> {
    return this.findByPk(id);
  }

  where(field: string): WhereClause {
    return new QueryBuilder(this).where(field);
  }

  orderBy(field: string): QueryBuilder {
    return new QueryBuilder(this).orderBy(field);
  }

  async toArray(): Promise<ModelInstance[]> {
    return this.findAll();
  }

  async count(): Promise<number> {
    await this.orm._initDatabase();

    const db = this.orm.db!;
    const tx = db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(new IndexedDBError('Failed to count records', request.error));
    });
  }

  async clear(): Promise<number> {
    await this.orm._initDatabase();

    const db = this.orm.db!;
    const tx = db.transaction([this.storeName], 'readwrite');
    const store = tx.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => resolve(count);
        clearRequest.onerror = () =>
          reject(new IndexedDBError('Failed to clear store', clearRequest.error));
      };

      countRequest.onerror = () =>
        reject(new IndexedDBError('Failed to count records', countRequest.error));
    });
  }

  async bulkAdd(dataArray: Record<string, unknown>[]): Promise<ModelInstance[]> {
    return this.bulkCreate(dataArray);
  }

  async bulkDelete(ids: IDBValidKey[]): Promise<number> {
    await this.orm._initDatabase();

    const db = this.orm.db!;
    const tx = db.transaction([this.storeName], 'readwrite');
    const store = tx.objectStore(this.storeName);

    let count = 0;

    return new Promise((resolve, reject) => {
      const deleteNext = (index: number) => {
        if (index >= ids.length) {
          resolve(count);
          return;
        }

        const request = store.delete(ids[index]);

        request.onsuccess = () => {
          count++;
          deleteNext(index + 1);
        };

        request.onerror = () => {
          reject(new IndexedDBError('Failed to delete record', request.error));
        };
      };

      deleteNext(0);
    });
  }
}

/**
 * IndexedDB ORM main class
 */
export class IndexedDBORM {
  dbName: string;
  version: number;
  db: IDBDatabase | null = null;
  models: Map<string, Model> = new Map();
  schema: Map<string, { attributes: Record<string, AttributeConfig>; options: ModelOptions }> =
    new Map();
  isInitialized = false;

  constructor(dbName: string, options: ORMOptions = {}) {
    this.dbName = dbName;
    this.version = options.version || 1;
  }

  define(
    storeName: string,
    attributes: Record<string, AttributeConfig>,
    options: ModelOptions = {}
  ): Model {
    this.schema.set(storeName, { attributes, options });

    const model = new Model(this, storeName, attributes, options);
    this.models.set(storeName, model);

    return model;
  }

  async _initDatabase(): Promise<IDBDatabase> {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new IndexedDBError('Failed to open database', request.error));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        for (const [storeName, schema] of this.schema.entries()) {
          if (!db.objectStoreNames.contains(storeName)) {
            const { attributes, options } = schema;

            const primaryKey = Object.entries(attributes).find(
              ([, config]) => config.primaryKey
            );

            const storeOptions: IDBObjectStoreParameters = {};
            if (primaryKey) {
              storeOptions.keyPath = primaryKey[0];
              if (primaryKey[1].autoIncrement) {
                storeOptions.autoIncrement = true;
              }
            }

            const objectStore = db.createObjectStore(storeName, storeOptions);

            if (options.indexes && Array.isArray(options.indexes)) {
              for (const index of options.indexes) {
                const indexName = Array.isArray(index.fields)
                  ? index.fields.join('_')
                  : index.fields;
                const keyPath = Array.isArray(index.fields)
                  ? index.fields.length === 1
                    ? index.fields[0]
                    : index.fields
                  : index.fields;

                objectStore.createIndex(indexName, keyPath, {
                  unique: index.unique || false,
                  multiEntry: index.multiEntry || false
                });
              }
            }

            for (const [fieldName, config] of Object.entries(attributes)) {
              if (config.unique && !config.primaryKey) {
                objectStore.createIndex(fieldName, fieldName, { unique: true });
              }
            }
          }
        }
      };

      request.onblocked = () => {
        reject(
          new IndexedDBError(
            'Database upgrade blocked. Please close other tabs using this database.'
          )
        );
      };
    });
  }

  async transaction<T>(callback: (proxy: TransactionProxy) => Promise<T>): Promise<T> {
    await this._initDatabase();

    const storeNames = Array.from(this.models.keys());
    const tx = this.db!.transaction(storeNames, 'readwrite');
    const transactionProxy = new TransactionProxy(tx, this);

    try {
      const result = await callback(transactionProxy);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () =>
          reject(new IndexedDBError('Transaction failed', tx.error));
        tx.onabort = () => reject(new IndexedDBError('Transaction aborted'));
      });
    } catch (error) {
      tx.abort();
      throw error;
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  static async deleteDatabase(dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new IndexedDBError('Failed to delete database', request.error));
      request.onblocked = () =>
        reject(
          new IndexedDBError(
            'Database deletion blocked. Please close other tabs using this database.'
          )
        );
    });
  }
}

export default IndexedDBORM;
