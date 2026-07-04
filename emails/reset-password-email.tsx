import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetUrl: string;
  userEmail?: string;
}

export const ResetPasswordEmail = ({
  resetUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>重置你的汉韵写真密码</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>重置你的汉韵写真密码</Heading>

          <Text style={text}>
            我们收到了重置密码请求，请点击下方按钮设置新密码。
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              重置密码
            </Button>
          </Section>

          <Text style={text}>
            你也可以复制以下链接到浏览器打开：
          </Text>

          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>

          <Text style={warning}>
            此链接将在 1 小时后失效。
          </Text>

          <Text style={footer}>
            如果你没有请求重置密码，可以忽略这封邮件。你的密码不会被更改。
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const buttonContainer = {
  margin: '27px 0',
};

const link = {
  color: '#2754C5',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const warning = {
  color: '#ff6b6b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '20px 0',
  fontWeight: '500',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '30px 0 0',
};
