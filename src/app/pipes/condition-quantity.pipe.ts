import { Pipe, PipeTransform } from '@angular/core';
import { IConditionAndQuantity } from '../models/Equipment';

@Pipe({
  name: 'conditionQuantity'
})
export class ConditionQuantityPipe implements PipeTransform {

  transform(value: IConditionAndQuantity | undefined, ...args: unknown[]): string {
    return value?.quantity + ' ' + value?.condition;
  }

}
