import { UsersMongoRepository } from '../features/users/infrastructure/users-mongo.repository';
import { UsersRowSqlRepository } from '../features/users/infrastructure/users-rowSql.repository';

export enum RepositoryVariant {
  Mongo = 'mongo',
  RowPostgres = 'rowPostgres',
}

export enum RepositoryName {
  UsersRepository = 'UsersRepository',
}

export const repositoriesList = [
  {
    name: RepositoryName.UsersRepository,
    providers: {
      [RepositoryVariant.Mongo]: UsersMongoRepository,
      [RepositoryVariant.RowPostgres]: UsersRowSqlRepository,
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
