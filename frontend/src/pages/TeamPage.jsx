import { useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import MemberCard from '../components/MemberCard';
import { useTeamMembers } from '../hooks/useContent';
import { TEAM_CATEGORIES } from '../lib/contentMapper';

export default function TeamPage() {
  const { data: teamData, loading } = useTeamMembers();
  const [selectedYear, setSelectedYear] = useState(null);

  const committees = teamData?.committees ?? {};
  const years = Object.keys(committees).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const activeYear = selectedYear && committees[selectedYear] ? selectedYear : years[0];
  const currentCommittee = activeYear ? committees[activeYear] : {};

  const sections = TEAM_CATEGORIES.filter(({ key }) => key !== 'juniorExecutives');

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Our Team"
            subtitle="Meet the passionate individuals behind Eco Club"
          />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">

          {loading && years.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3FAE5C] border-t-transparent" />
              <p className="text-muted">Loading team members…</p>
            </div>
          )}

          {!loading && years.length === 0 && (
            <p className="py-16 text-center text-xl text-muted">
              Team information will be published soon.
            </p>
          )}

          {/* Year Selector */}
          {years.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-14">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-2 rounded-full transition-all font-medium ${
                    activeYear === year
                      ? "bg-[#3FAE5C] text-white"
                      : "bg-white border border-gray-300 hover:border-[#3FAE5C]"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Sections with Photos */}
          {sections.map(
            (section) =>
              currentCommittee[section.key] &&
              currentCommittee[section.key].length > 0 && (
                <div key={section.key} className="mb-16">

                  <h2 className="text-3xl font-bold text-center mb-10">
                    {section.label}
                  </h2>

                  <div className="flex flex-wrap justify-center gap-8">
                    {currentCommittee[section.key].map((member, index) => (
                      <div key={member.id || `${member.name}-${index}`} className="w-72">
                        <MemberCard
                          member={{
                            ...member,
                            image: member.image || '/logo.png',
                          }}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>

                </div>
              )
          )}

          {/* Junior Executives */}
          {currentCommittee.juniorExecutives &&
            currentCommittee.juniorExecutives.length > 0 && (
              <div className="mb-16">

                <h2 className="text-3xl font-bold text-center mb-10">
                  Junior Executives
                </h2>

                <div className="flex flex-wrap justify-center gap-5">
                  {currentCommittee.juniorExecutives.map((member, index) => (
                    <div
                      key={member.id || `${member.name}-${index}`}
                      className="w-64 bg-white rounded-xl shadow-card p-5 text-center border border-[#ECECEC] hover:border-[#3FAE5C] transition-all"
                    >
                      <h3 className="text-lg font-semibold text-[#222]">
                        {member.name}
                      </h3>
                    </div>
                  ))}
                </div>

              </div>
            )}

        </div>
      </section>
    </div>
  );
}
