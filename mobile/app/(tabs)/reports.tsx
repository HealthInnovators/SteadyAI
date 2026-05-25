import { SectionPlaceholder } from '../../src/screens/SectionPlaceholder';

export default function ReportsTab() {
  return (
    <SectionPlaceholder
      eyebrow="Reports"
      title="Progress that is easy to understand."
      description="This section will summarize workouts, nutrition, check-ins, and consistency trends."
      bullets={[
        'Load `/api/reports/overview` with the user token.',
        'Show weekly consistency and nutrition trends.',
        'Highlight the next useful action.'
      ]}
    />
  );
}
