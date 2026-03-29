export interface IBaseRepository<TEntity, TCreate, TUpdate> {
  findAll(): Promise<TEntity[]>;
  findById(id: string): Promise<TEntity | null>;
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
}
