import { UsersMongoRepository } from '../features/users/infrastructure/users-mongo.repository';
import { UsersRowSqlRepository } from '../features/users/infrastructure/users-rowSql.repository';
import { UsersQueryRowSqlRepository } from '../features/users/infrastructure/users-query-rowSql.repository';
import { UsersQueryMongoRepository } from '../features/users/infrastructure/users-query-mongo.repository';
import { AuthMongoRepository } from '../features/auth/infrastructure/auth-mongo.repository';
import { AuthRowSqlRepository } from '../features/auth/infrastructure/auth-rowsql.repository';
import { SecurityMongoQueryRepository } from '../features/auth/infrastructure/security-mongo-query.repository';
import { SecurityRowSqlQueryRepository } from 'src/features/auth/infrastructure/security-rowSql-query.repository';

export enum RepositoryVariant {
  Mongo = 'mongo',
  RowPostgres = 'rowPostgres',
}

export enum RepositoryName {
  UsersRepository = 'UsersRepository',
  UsersQueryRepository = 'UsersQueryRepository',
  AuthRepository = 'AuthRepository',
  SecurityQueryRepository = 'SecurityQueryRepository',
}

type TAnyClass = new (...args: any[]) => any;

type TRepoProviders = {
  [RepositoryVariant.Mongo]: TAnyClass;
  [RepositoryVariant.RowPostgres]: TAnyClass;
};

export const repositoriesList: {
  name: RepositoryName;
  providers: TRepoProviders;
}[] = [
  {
    name: RepositoryName.UsersRepository,
    providers: {
      [RepositoryVariant.Mongo]: UsersMongoRepository,
      [RepositoryVariant.RowPostgres]: UsersRowSqlRepository,
    },
  },
  {
    name: RepositoryName.UsersQueryRepository,
    providers: {
      [RepositoryVariant.Mongo]: UsersQueryMongoRepository,
      [RepositoryVariant.RowPostgres]: UsersQueryRowSqlRepository,
    },
  },
  {
    name: RepositoryName.AuthRepository,
    providers: {
      [RepositoryVariant.Mongo]: AuthMongoRepository,
      [RepositoryVariant.RowPostgres]: AuthRowSqlRepository,
    },
  },
  {
    name: RepositoryName.SecurityQueryRepository,
    providers: {
      [RepositoryVariant.Mongo]: SecurityMongoQueryRepository,
      [RepositoryVariant.RowPostgres]: SecurityRowSqlQueryRepository,
    },
  },
];

export const getRepository = (envRepositoryValue?: RepositoryVariant) => {
  const defaultRepository = RepositoryVariant.Mongo;

  if (!envRepositoryValue) {
    return defaultRepository;
  }

  const isEnvValuesValid =
    Object.values(RepositoryVariant).includes(envRepositoryValue);

  if (!isEnvValuesValid) {
    return defaultRepository;
  }

  return envRepositoryValue;
};
