import { Controller } from '@nestjs/common';
import { QnaService } from '../service/qna.service';

@Controller('qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}
}
