import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  
  @EventPattern('transaction.created')
  handleTransactionCreated(@Payload() data: any) {
    console.log(`[NotificationService] 🔔 New transaction created:`, data);
    // Real implementation would send an email/webhook here
  }

  @EventPattern('transaction.status_updated')
  handleTransactionStatusUpdated(@Payload() data: any) {
    console.log(`[NotificationService] 🔄 Transaction status updated to ${data.status}:`, data);
  }
}
