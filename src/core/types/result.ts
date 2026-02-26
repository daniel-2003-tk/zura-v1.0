export class Result<T> {
    public isSuccess: boolean;
    public isFailure: boolean;
    public error?: string;
    private _value?: T;
  
    private constructor(isSuccess: boolean, error?: string, value?: T) {
      if (isSuccess && error) {
        throw new Error("InvalidOperation: Um resultado não pode ser sucesso e conter erro.");
      }
      if (!isSuccess && !error) {
        throw new Error("InvalidOperation: Um resultado de falha precisa conter uma mensagem de erro.");
      }
  
      this.isSuccess = isSuccess;
      this.isFailure = !isSuccess;
      this.error = error;
      this._value = value;
    }
  
    public getValue(): T {
      if (!this.isSuccess) {
        throw new Error("Não é possível pegar o valor de um resultado de erro.");
      }
      return this._value as T;
    }
  
    public static ok<U>(value?: U): Result<U> {
      return new Result<U>(true, undefined, value);
    }
  
    public static fail<U>(error: string): Result<U> {
      return new Result<U>(false, error);
    }
  }