import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get appointments that are happening in the next 24 hours
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: appointments, error } = await supabaseAdmin
      .from('appointment')
      .select(`
        id,
        appointment_date,
        appointment_time,
        patient_name,
        patient_email,
        partner (
          name
        )
      `)
      .eq('appointment_date', tomorrowStr)
      .not('reminder_sent', 'eq', true)

    if (error) throw error

    // Send email for each appointment
    for (const appointment of appointments) {
      // Send email using Supabase Auth
      const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
        email: appointment.patient_email,
        subject: 'Appointment Reminder',
        template: 'appointment-reminder',
        template_data: {
          patient_name: appointment.patient_name,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          partner_name: appointment.partner.name
        }
      })

      if (emailError) {
        console.error(`Failed to send email for appointment ${appointment.id}:`, emailError)
        continue
      }

      // Mark reminder as sent
      const { error: updateError } = await supabaseAdmin
        .from('appointment')
        .update({ reminder_sent: true })
        .eq('id', appointment.id)

      if (updateError) {
        console.error(`Failed to update reminder status for appointment ${appointment.id}:`, updateError)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Reminders sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
