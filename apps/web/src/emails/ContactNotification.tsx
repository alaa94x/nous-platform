import {
  Html, Head, Body, Container, Section,
  Heading, Text, Hr, Row, Column,
} from '@react-email/components'

export interface ContactNotificationProps {
  name: string
  email: string
  phone?: string
  services: string[]
  message?: string
}

export function ContactNotification({
  name,
  email,
  phone,
  services,
  message,
}: ContactNotificationProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ background: '#F9F8F6', margin: 0, padding: 0, fontFamily: "'Courier New', monospace" }}>
        <Container style={{ maxWidth: 560, margin: '48px auto', padding: '0 16px' }}>
          {/* Header bar */}
          <Section style={{ background: '#084734', padding: '20px 32px', borderRadius: '4px 4px 0 0' }}>
            <Text style={{ margin: 0, fontSize: 9, letterSpacing: '0.22em', color: '#CDEDB3', textTransform: 'uppercase' }}>
              [ NOUS, NEW BRIEF ]
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ background: '#FFFFFF', border: '1px solid rgba(18,28,26,.08)', borderTop: 'none', padding: '36px 32px', borderRadius: '0 0 4px 4px' }}>
            <Heading style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 300, color: '#121C1A', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
              {name} sent a brief.
            </Heading>
            <Text style={{ margin: '0 0 28px', fontSize: 12, color: '#556B66' }}>
              Submitted via nous.qa contact form
            </Text>

            <Hr style={{ borderColor: 'rgba(18,28,26,.08)', margin: '0 0 24px' }} />

            <Row style={{ marginBottom: 14 }}>
              <Column style={{ width: 100 }}>
                <Text style={{ margin: 0, fontSize: 9, letterSpacing: '.14em', color: '#556B66', textTransform: 'uppercase' }}>Email</Text>
              </Column>
              <Column>
                <Text style={{ margin: 0, fontSize: 13, color: '#121C1A' }}>{email}</Text>
              </Column>
            </Row>

            {phone && (
              <Row style={{ marginBottom: 14 }}>
                <Column style={{ width: 100 }}>
                  <Text style={{ margin: 0, fontSize: 9, letterSpacing: '.14em', color: '#556B66', textTransform: 'uppercase' }}>Phone</Text>
                </Column>
                <Column>
                  <Text style={{ margin: 0, fontSize: 13, color: '#121C1A' }}>{phone}</Text>
                </Column>
              </Row>
            )}

            <Row style={{ marginBottom: 24 }}>
              <Column style={{ width: 100 }}>
                <Text style={{ margin: 0, fontSize: 9, letterSpacing: '.14em', color: '#556B66', textTransform: 'uppercase' }}>Services</Text>
              </Column>
              <Column>
                <Text style={{ margin: 0, fontSize: 13, color: '#121C1A' }}>{services.join(', ')}</Text>
              </Column>
            </Row>

            {message && (
              <>
                <Hr style={{ borderColor: 'rgba(18,28,26,.08)', margin: '0 0 20px' }} />
                <Text style={{ margin: '0 0 6px', fontSize: 9, letterSpacing: '.14em', color: '#556B66', textTransform: 'uppercase' }}>Vision</Text>
                <Text style={{ margin: 0, fontSize: 13, color: '#121C1A', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{message}</Text>
              </>
            )}

            <Hr style={{ borderColor: 'rgba(18,28,26,.08)', margin: '28px 0 20px' }} />

            <Text style={{ margin: 0, fontSize: 11, color: '#556B66' }}>
              Reply directly to this email to reach {name}, or open the admin dashboard to manage the submission.
            </Text>
          </Section>

          <Text style={{ margin: '20px 0 0', fontSize: 10, color: '#7a9189', textAlign: 'center', letterSpacing: '.08em' }}>
            nous.qa - Doha, Qatar
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
