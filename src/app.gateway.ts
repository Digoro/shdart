import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CorpService } from './app.service';

@WebSocketGateway({ namespace: 'shWebsocket' })
export class AppGateway {
  @WebSocketServer() server;

  constructor(
    private corpService: CorpService,
  ) { }

  @SubscribeMessage('getSummaryMarket')
  async getSummaryMarket(socket: Socket) {
    this.retry(10, async () => {
      const result = await this.corpService.summaryMarket();
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        await this.server.to(socket.id).emit('emitSummaryMarket', chunkText);
      }
    })
  }

  @SubscribeMessage('getSummaryCorp')
  async getSummaryCorp(socket: Socket, data: { corpName: string }) {
    this.retry(10, async () => {
      const result = await this.corpService.summaryCorp(data.corpName);
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        await this.server.to(socket.id).emit('emitSummaryCorp', chunkText);
      }
    })
  }

  async retry(count: number, call: () => {}, tryCount: number = 1) {
    try {
      await call();
    } catch (e) {
      if (tryCount <= count) {
        tryCount += 1;
        setTimeout(async () => {
          await this.retry(count, call, tryCount);
        }, 5000);
      }
    }
  }
}
