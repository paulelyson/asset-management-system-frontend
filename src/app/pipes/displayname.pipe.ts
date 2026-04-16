import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../models/User';

@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
  transform(value: any, ...fields: string[]): string {
    if (!value || !fields.length) return '';

    return fields
      .map(field => value?.[field])
      .filter(Boolean)
      .join(' ');
  }
}
