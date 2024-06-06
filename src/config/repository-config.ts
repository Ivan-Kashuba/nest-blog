import { UsersMongoRepository } from '../features/users/infrastructure/users-mongo.repository';
import { UsersRowSqlRepository } from '../features/users/infrastructure/users-rowSql.repository';
import { UsersRepository } from '../features/users/infrastructure/abstract-users.repository';

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
    provider: {
      [RepositoryVariant.Mongo]: UsersMongoRepository,
      [RepositoryVariant.RowPostgres]: UsersMongoRepository,
    },
  },
];

export const getRepository = (envRepositoryValue?: string) => {
  const defaultRepository = RepositoryVariant.Mongo;

  if (!envRepositoryValue) {
    return defaultRepository;
  }

  if (!RepositoryVariant[envRepositoryValue]) {
    return defaultRepository;
  }

  return RepositoryVariant[envRepositoryValue];
};
