import { Controller } from '@nestjs/common';
import { NoticeService } from '../service/notice.service';

@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}
}
