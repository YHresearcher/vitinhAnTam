import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateReadingTime } from '@/lib/reading-time';
import { isValidAgentKey } from '@/lib/server/agentAuth';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: NextRequest) {
  try {
    if (!isValidAgentKey(req)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Invalid x-agent-key.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      slug: customSlug,
      category_id,
      tags = [],
      cover_image,
      author_name = 'Agentic AI Writer',
      status = 'draft',
      meta_title,
      meta_description,
      focus_keyword,
      faq_schema = [],
      related_inventory_ids = [],
      service_cta_type = 'spa_laptop',
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content.' },
        { status: 400 }
      );
    }

    const finalSlug = customSlug?.trim() || generateSlug(title);
    const readingStats = calculateReadingTime(content);

    const postPayload = {
      title,
      slug: finalSlug,
      excerpt: excerpt || content.replace(/<[^>]*>/g, ' ').slice(0, 160).trim(),
      content,
      cover_image: cover_image || null,
      category_id: category_id || null,
      tags: Array.isArray(tags) ? tags : [],
      author_name,
      status: ['draft', 'published', 'archived'].includes(status) ? status : 'draft',
      meta_title: meta_title || `${title} | Vi Tính An Tâm`,
      meta_description: meta_description || excerpt || title,
      focus_keyword: focus_keyword || '',
      faq_schema: Array.isArray(faq_schema) ? faq_schema : [],
      reading_time_minutes: readingStats.minutes,
      word_count: readingStats.words,
      related_inventory_ids: Array.isArray(related_inventory_ids) ? related_inventory_ids : [],
      service_cta_type,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('blog_posts').insert(postPayload).select().single();
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        message: 'Blog post ingested successfully by Agentic AI pipeline.',
        data,
        preview_url: `/tin-tuc/${finalSlug}`,
        reading_stats: readingStats,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Local mock mode: Post validated successfully.',
      data: postPayload,
      preview_url: `/tin-tuc/${finalSlug}`,
      reading_stats: readingStats,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
