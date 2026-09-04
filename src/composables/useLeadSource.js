export function useLeadSource() {
  const getSourceIcon = (sourceName) => {
    if (!sourceName) return 'bi bi-funnel-fill';
    const name = String(sourceName).toLowerCase().trim();

    if (name.includes('website') || name.includes('web') || name.includes('form') || name.includes('portal') || name.includes('landing')) {
      return 'bi bi-globe2';
    }
    if (name.includes('phone') || name.includes('call') || name.includes('inbound') || name.includes('tele')) {
      return 'bi bi-telephone-fill';
    }
    if (name.includes('email') || name.includes('mail') || name.includes('newsletter')) {
      return 'bi bi-envelope-fill';
    }
    if (name.includes('facebook') || name.includes('fb')) {
      return 'bi bi-facebook';
    }
    if (name.includes('instagram') || name.includes('insta')) {
      return 'bi bi-instagram';
    }
    if (name.includes('linkedin')) {
      return 'bi bi-linkedin';
    }
    if (name.includes('social')) {
      return 'bi bi-share-fill';
    }
    if (name.includes('google') || name.includes('ad') || name.includes('campaign') || name.includes('marketing')) {
      return 'bi bi-megaphone-fill';
    }
    if (name.includes('referral') || name.includes('partner') || name.includes('recommendation')) {
      return 'bi bi-person-heart';
    }
    if (name.includes('walk') || name.includes('store') || name.includes('office') || name.includes('visit')) {
      return 'bi bi-geo-alt-fill';
    }
    if (name.includes('manual') || name.includes('direct') || name.includes('entry') || name.includes('staff')) {
      return 'bi bi-pencil-square';
    }
    if (name.includes('whatsapp')) {
      return 'bi bi-whatsapp';
    }

    return 'bi bi-funnel-fill';
  };

  const getSourceBadgeClass = (sourceName) => {
    if (!sourceName) return 'badge-source-other';
    const name = String(sourceName).toLowerCase().trim();

    if (name.includes('website') || name.includes('web') || name.includes('form') || name.includes('landing')) {
      return 'badge-source-website';
    }
    if (name.includes('phone') || name.includes('call')) {
      return 'badge-source-phone';
    }
    if (name.includes('email') || name.includes('mail')) {
      return 'badge-source-email';
    }
    if (name.includes('facebook') || name.includes('fb')) {
      return 'badge-source-facebook';
    }
    if (name.includes('instagram') || name.includes('insta')) {
      return 'badge-source-instagram';
    }
    if (name.includes('social') || name.includes('linkedin')) {
      return 'badge-source-social';
    }
    if (name.includes('google') || name.includes('ad') || name.includes('campaign')) {
      return 'badge-source-ads';
    }
    if (name.includes('referral') || name.includes('partner')) {
      return 'badge-source-referral';
    }
    if (name.includes('walk') || name.includes('visit')) {
      return 'badge-source-walkin';
    }
    if (name.includes('manual') || name.includes('direct')) {
      return 'badge-source-manual';
    }
    if (name.includes('whatsapp')) {
      return 'badge-source-whatsapp';
    }

    return 'badge-source-other';
  };

  const getFollowUpTypeIcon = (type) => {
    switch (type) {
      case 'call':
        return 'bi bi-telephone-fill';
      case 'email':
        return 'bi bi-envelope-fill';
      case 'meeting':
        return 'bi bi-people-fill';
      case 'task':
        return 'bi bi-check2-square';
      case 'note':
        return 'bi bi-journal-text';
      case 'whatsapp':
        return 'bi bi-whatsapp';
      default:
        return 'bi bi-calendar-check-fill';
    }
  };

  const getFollowUpTypeBadgeClass = (type) => {
    switch (type) {
      case 'call':
        return 'badge-followup-call';
      case 'email':
        return 'badge-followup-email';
      case 'meeting':
        return 'badge-followup-meeting';
      case 'task':
      case 'note':
        return 'badge-followup-task';
      case 'whatsapp':
        return 'badge-followup-whatsapp';
      default:
        return 'badge-low';
    }
  };

  return {
    getSourceIcon,
    getSourceBadgeClass,
    getFollowUpTypeIcon,
    getFollowUpTypeBadgeClass
  };
}
