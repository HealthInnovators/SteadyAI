import { SectionPlaceholder } from '../../src/screens/SectionPlaceholder';

export default function CommunityTab() {
  return (
    <SectionPlaceholder
      eyebrow="Community"
      title="Support without pressure."
      description="This section will help users draft check-ins, posts, and supportive peer replies."
      bullets={[
        'Show lightweight community prompts.',
        'Draft posts from AI coach context.',
        'Keep engagement simple and mobile-friendly.'
      ]}
    />
  );
}
