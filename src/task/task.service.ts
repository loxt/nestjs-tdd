import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  async createTask({}: any) {
    throw new Error();
  }
}
