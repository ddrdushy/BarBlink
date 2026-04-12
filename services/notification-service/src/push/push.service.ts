import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private initialized = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.config.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FCM_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        this.initialized = true;
        this.logger.log('Firebase Admin initialized — push notifications enabled');
      } catch (error: any) {
        this.logger.warn(`Firebase init failed: ${error.message}. Push disabled.`);
      }
    } else {
      this.logger.warn('FCM credentials not set — push notifications will be logged only');
    }
  }

  async sendPush(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
    if (!this.initialized) {
      this.logger.log(`[DEV PUSH] To: ${token.slice(0, 20)}... | ${title}: ${body}`);
      return true;
    }

    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'barblink_default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });
      this.logger.log(`Push sent to ${token.slice(0, 20)}...`);
      return true;
    } catch (error: any) {
      this.logger.error(`Push failed: ${error.message}`);
      return false;
    }
  }

  async sendToMultiple(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<number> {
    if (tokens.length === 0) return 0;

    if (!this.initialized) {
      this.logger.log(`[DEV PUSH] To ${tokens.length} devices | ${title}: ${body}`);
      return tokens.length;
    }

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data || {},
      });
      this.logger.log(`Push sent: ${response.successCount}/${tokens.length} succeeded`);
      return response.successCount;
    } catch (error: any) {
      this.logger.error(`Multi-push failed: ${error.message}`);
      return 0;
    }
  }
}
