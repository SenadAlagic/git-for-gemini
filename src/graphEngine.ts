export type Conversation = {
  id: string;
  name: string;
  branch: Branch;
};

export type Branch = {
  id: string;
  name: string;
  head?: Commit;
};

export type Commit = {
  id: string;
  parent?: Commit;
  text: string;
};

const conversations = new Map<string, Conversation>();
const branches = new Map<string, Branch>();
const messages = new Map<string, Commit>();
let activeBranch: Branch | undefined;

const addConversation = (name: string) => {
  const branch = addBranch("main");
  conversations.set(name, {
    id: crypto.randomUUID(),
    name,
    branch,
  });
};

const addBranch = (name: string) => {
  const head: Commit | undefined = activeBranch ? activeBranch.head : undefined;
  const branch: Branch = {
    id: crypto.randomUUID(),
    name,
    head,
  };
  branches.set(branch.name, branch);
  activeBranch = branch;
  return branch;
};

const addMessage = (text: string) => {
  const currentBranch = getCurrentBranch();
  const commit: Commit = {
    id: crypto.randomUUID(),
    text,
    parent: currentBranch.head,
  };
  messages.set(commit.id, commit);
  currentBranch.head = commit;
  return commit;
};

const getCurrentBranch = () => {
  if (!activeBranch) {
    throw new Error("Current branch doesn't exist");
  }
  return activeBranch;
};

const checkoutBranch = (name: string) => {
  const branch = branches.get(name);
  if (!branch) {
    throw new Error("Branch doesn't exist");
  }
  activeBranch = branch;
  return branch;
};

const getHistory = () => {
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    throw new Error("Current branch doesn't exist");
  }
  if (!currentBranch.head) {
    throw new Error("Current branch doesn't have a HEAD commit");
  }

  const messageArray: string[] = [];
  let workingCommit: Commit = currentBranch.head;

  while (true) {
    messageArray.push(workingCommit.text);

    if (workingCommit.parent) {
      workingCommit = workingCommit.parent;
    } else {
      break;
    }
  }

  return messageArray.reverse();
};

export const playgroundTest = () => {
  addConversation("first-conversation");
  addMessage("Hello");
  addMessage("How's it going?");
  addMessage("Does it work?");
  addBranch("feature-branch");
  addMessage("This is from branch 'feature-branch'");
  console.log(`[${getCurrentBranch().name}]`, getHistory());
  checkoutBranch("main");
  addMessage("And this is on branch 'main'");
  console.log(`[${getCurrentBranch().name}]`, getHistory());
};
