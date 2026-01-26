import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Window from "../../components/ui/Window";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "What is Rhythmic?",
    answer: "Rhythmic is a comprehensive playlist management tool that helps you manage, sync, and organize your music playlists across multiple streaming platforms including Spotify and YouTube Music."
  },
  {
    category: "Getting Started",
    question: "How do I connect my music accounts?",
    answer: "Navigate to the Connections page from the sidebar. Click 'Connect' for each platform you want to add (Spotify, YouTube Music, etc.). You'll be redirected to authenticate with the platform and grant necessary permissions."
  },
  {
    category: "Getting Started",
    question: "Which platforms are supported?",
    answer: "Currently, Rhythmic supports Spotify and YouTube Music (Google). You can connect multiple accounts from each platform."
  },

  // Playlist Management
  {
    category: "Playlist Management",
    question: "How do I create a new playlist?",
    answer: "Go to the Playlists page and click the 'NEW' button in the top navigation. Choose the platform and account where you want to create the playlist, enter a name and optional description, and set the visibility (public/private)."
  },
  {
    category: "Playlist Management",
    question: "Can I edit playlist details?",
    answer: "Yes! Click on any playlist to open the details modal. You can add/remove songs, search for new tracks, and use various management tools."
  },
  {
    category: "Playlist Management",
    question: "How do I delete a playlist?",
    answer: "Click the three-dot menu (⋮) next to any playlist and select 'Delete'. You'll be asked to confirm before the playlist is permanently removed."
  },

  // Playlist Sync
  {
    category: "Playlist Sync",
    question: "What is playlist synchronization?",
    answer: "Playlist sync allows you to keep multiple playlists in sync across different platforms or accounts. When you add or remove tracks from one playlist, the changes are automatically reflected in all linked playlists."
  },
  {
    category: "Playlist Sync",
    question: "How do I set up a sync group?",
    answer: "Click the three-dot menu on a playlist and select 'Sync'. Choose a master playlist (the source of truth) and select one or more child playlists to sync with it. You can enable/disable sync at any time."
  },
  {
    category: "Playlist Sync",
    question: "Can I add or remove playlists from an existing sync group?",
    answer: "Yes! Click 'Configure Sync' on any playlist that's already part of a sync group. You can add new child playlists or remove existing ones from the configuration panel."
  },
  {
    category: "Playlist Sync",
    question: "What happens when I sync playlists?",
    answer: "Before synchronization begins, a snapshot is automatically created for all child playlists. Then, the child playlists are updated to match the master playlist's content. You can always revert using the snapshot if needed."
  },

  // Backup & Version Control
  {
    category: "Backup & Version Control",
    question: "What are snapshots?",
    answer: "Snapshots are point-in-time backups of your playlists. They capture the exact state of a playlist including all tracks, allowing you to revert changes if needed."
  },
  {
    category: "Backup & Version Control",
    question: "How do I create a snapshot?",
    answer: "Click the three-dot menu on a playlist and select 'History'. In the history panel, click 'Create Snapshot'. Snapshots are also automatically created before sync operations."
  },
  {
    category: "Backup & Version Control",
    question: "How do I restore a snapshot?",
    answer: "Open the playlist's History panel, select the snapshot you want to restore, and click 'Revert to this Version'. The playlist will be restored to that exact state."
  },

  // Duplicate Finder
  {
    category: "Duplicate Finder",
    question: "How does the duplicate finder work?",
    answer: "The duplicate finder scans your playlist and identifies songs that appear multiple times. Open any playlist, click the cleaning brush icon, and press 'Start' to begin scanning."
  },
  {
    category: "Duplicate Finder",
    question: "How do I remove duplicates?",
    answer: "After scanning completes, duplicate tracks will be highlighted in red and listed in the duplicate finder panel. Select the duplicates you want to remove and click 'Delete Selected'."
  },
  {
    category: "Duplicate Finder",
    question: "Why do some songs appear as duplicates when they're not?",
    answer: "The duplicate finder identifies tracks with identical titles and artists. Sometimes different versions of the same song (live, remix, remaster) may be flagged. Review carefully before deleting."
  },

  // Playlist Tools
  {
    category: "Playlist Tools",
    question: "How do I split a large playlist?",
    answer: "Click the three-dot menu on a playlist and select 'Split'. Choose how many songs per new playlist, and the system will automatically create multiple smaller playlists with your content divided evenly."
  },
  {
    category: "Playlist Tools",
    question: "How do I transfer a playlist to another platform?",
    answer: "Click 'Transfer' from the playlist menu. Select the destination platform and account. The system will attempt to match all songs and create a new playlist on the target platform."
  },
  {
    category: "Playlist Tools",
    question: "What happens if a song can't be found during transfer?",
    answer: "The transfer process will do its best to match songs across platforms. If a song isn't available on the destination platform, it will be skipped. You'll see the final count after transfer completes."
  },

  // Search & Filtering
  {
    category: "Search & Filtering",
    question: "How do I search for playlists?",
    answer: "Use the search bar on the Playlists page. You can search by title, or use advanced syntax like 'tracks > 50' to find playlists with more than 50 songs, or 'provider = spotify' to filter by platform."
  },
  {
    category: "Search & Filtering",
    question: "What search operators are available?",
    answer: "You can use: title (partial match), tracks with >, <, = operators, and provider = spotify/google. Combine multiple criteria with '&'. Example: 'rock & tracks > 20 & provider = spotify'"
  },

  // Admin Features
  {
    category: "Admin Features",
    question: "What can admins do?",
    answer: "Admins can access the Admin Panel to view system statistics, manage users, create new user accounts, assign roles, and send password reset emails. They also have access to all audit logs."
  },
  {
    category: "Admin Features",
    question: "How do I view system activity?",
    answer: "Navigate to the Activity page to see a complete audit log of all actions in the system including playlist operations, user activities, and system events. You can filter by action type."
  },

  // Account & Settings
  {
    category: "Account & Settings",
    question: "How do I change my password?",
    answer: "Go to Settings from the sidebar. Enter your current password and your new password twice to confirm. Click 'Update Password' to save changes."
  },
  {
    category: "Account & Settings",
    question: "Can I change my email address?",
    answer: "Yes, go to Settings and update your email in the account information section. Make sure to save your changes."
  },
  {
    category: "Account & Settings",
    question: "How do I disconnect a music account?",
    answer: "Go to the Connections page, find the account you want to remove, and click 'Disconnect'. Note that this will affect any playlists or sync groups using that account."
  },

  // Troubleshooting
  {
    category: "Troubleshooting",
    question: "Why aren't my playlists showing up?",
    answer: "Make sure you've connected at least one music account in the Connections page. After connecting, refresh the Playlists page. It may take a moment to load all your playlists."
  },
  {
    category: "Troubleshooting",
    question: "My sync isn't working. What should I check?",
    answer: "Verify that: 1) The sync group is enabled, 2) All accounts in the sync group are still connected, 3) You have proper permissions on all playlists. Check the Activity page for any error messages."
  },
  {
    category: "Troubleshooting",
    question: "Can I undo a playlist operation?",
    answer: "For most operations, you can use the History/Snapshot feature to revert changes. Always create a snapshot before major changes. Some operations like deletion are permanent."
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="p-6 font-mono flex flex-col text-black w-full overflow-hidden">

      <Window
        containerClassName="w-full h-full box-style-md overflow-hidden bg-gradient-to-b from-[#fff6e7] to-[#fff3db]"
        ribbonClassName="bg-[#40a8d0] border-b-4 border-black text-white font-extrabold"
        windowClassName="bg-[#fff9ec] overflow-hidden"
        ribbonContent={
          <div className="flex items-center justify-between w-full px-4 py-1">
            <h2 className="text-lg text-white uppercase tracking-wider font-bold">
              Help & FAQ
            </h2>
          </div>
        }>
        <div className="p-4 flex flex-col h-full gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[75vh] bg-white border-2 border-black box-style-md p-2 sm:p-4 space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-2 border-black box-style-sm bg-[#fffaf5] overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-3 py-3 flex items-start justify-between hover:bg-[#fff3e6] transition cursor-pointer text-left">
                  <span className="font-bold text-xs sm:text-sm pr-2">
                    {faq.question}
                  </span>
                  {openItems.has(index) ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  )}
                </button>

                {openItems.has(index) && (
                  <div className="px-3 py-3 border-t-2 border-black bg-white">
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-700">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Window>
    </div>
  );
}
