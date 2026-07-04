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

interface VerificationEmailProps {
  verificationUrl: string;
  userEmail?: string;
}

export const VerificationEmail = ({
  verificationUrl,
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>验证你的汉韵写真账户</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>验证你的汉韵写真账户</Heading>

          <Text style={text}>
            点击下方按钮完成邮箱验证，开始创作 AI 汉服写真。
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              完成邮箱验证
            </Button>
          </Section>

          <Text style={text}>
            你也可以复制以下链接到浏览器打开：
          </Text>

          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>

          <Text style={footer}>
            如果你没有注册汉韵写真账户，可以忽略这封邮件。
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

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

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '30px 0 0',
};
