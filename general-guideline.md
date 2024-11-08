PR Reviews
- Based on the impact of change
  - Either tag your team or both
  - Approver should make sure to manually test all screens/features impacted by the changes in PR.
- Number of approvers
  - Any number you like from your team
  - 1 Approver from other team
- Timeline for review
  - Start by tagging all team members with link of PR in common chat
  - PR author wait for at least 24 hours before any further action
- Both Team join review when a new reusable component is being added to the library.
 
Branching model
- Branch name 
  - taskNumber-appName-optionalDescription
 
Communications
- Create a new Teams channel for both teams with Parking Lot section.
- Put a calender reminder for spring demo
- When developing a new shared component, give heads up to other team, so that they are aware and could avoid duplicate effort
 
Pairing
- Consider pairing for any significant changes to common code(atom, molecules or UI feature)
  - If paring is not possible than we can do quick review about changes before diving into actual work.   
 
  Action Items
- Figure out a way in NX to determine which apps/module a change is affecting.
- Can the automatic builds be dynamic(based on which app/module was changed).
- Storybook needs to be configured for all components under ui-common and features.  
- Explore option to automatically tag reviewers based on changes in a given PR. [Low Priority]
- Check if GitHub allows custom number of approvers based on some change identification. [Low Priority]
- Commit message conflict if all teams try release to prod simultaneously. Need to find a fix for that. [Low Priority until Endeavor starts releasing]
