# 🔒 GitHub Branch Protection Setup Guide

## 📋 Overview

This guide will help you set up branch protection rules to prevent direct pushes to `main` and accidental deletion of `development` branch.

---

## 🎯 Goals

1. ✅ Prevent direct pushes to `main` branch
2. ✅ Require Pull Requests for all changes to `main`
3. ✅ Require CI/CD checks to pass before merging
4. ✅ Prevent accidental deletion of `main` and `development` branches
5. ✅ Enforce code review process

---

## 🔧 Setup Instructions

### **Step 1: Navigate to Branch Protection Settings**

1. Go to: https://github.com/Chrisdalbano/valuebuild-web
2. Click **Settings** (top navigation bar)
3. In left sidebar, click **Branches** (under "Code and automation")
4. Click **Add branch protection rule**

---

### **Step 2: Configure Protection for `main` Branch**

#### **Branch name pattern:**
```
main
```

#### **Protection Settings:**

##### 🔐 **Require a pull request before merging**
```
☑️ Require a pull request before merging
  ☑️ Require approvals: 1
  ☑️ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (optional - we created CODEOWNERS file)
  ☐ Restrict who can dismiss pull request reviews
  ☑️ Allow specified actors to bypass required pull requests (leave empty)
```

**What this does:**
- Forces all changes to go through Pull Requests
- Requires at least 1 approval before merging
- You can approve your own PRs (since you're the sole developer)

---

##### ✅ **Require status checks to pass before merging**
```
☑️ Require status checks to pass before merging
  ☑️ Require branches to be up to date before merging

  Status checks found in the repository:
  ☑️ test-backend
  ☑️ test-frontend
```

**What this does:**
- GitHub Actions must pass before merging
- Ensures backend and frontend build successfully
- Branch must be up-to-date with main

---

##### 💬 **Require conversation resolution before merging**
```
☑️ Require conversation resolution before merging
```

**What this does:**
- All PR comments/discussions must be resolved
- Prevents merging with unresolved feedback

---

##### 🔒 **Require signed commits** (Optional)
```
☐ Require signed commits (optional - for extra security)
```

**What this does:**
- Requires GPG-signed commits
- Verifies author identity
- Recommended for sensitive projects

---

##### 📈 **Require linear history** (Optional)
```
☑️ Require linear history
```

**What this does:**
- Prevents merge commits
- Keeps git history clean and linear
- Forces rebase or squash merging

---

##### 🚫 **Do not allow bypassing the above settings**
```
☑️ Do not allow bypassing the above settings
  ☑️ Include administrators
```

**What this does:**
- Enforces rules even for repository administrators (you)
- No exceptions - everyone follows the rules

---

##### 🔐 **Restrict who can push to matching branches**
```
☑️ Restrict who can push to matching branches
  [Leave empty - no one can push directly]
```

**What this does:**
- **PREVENTS DIRECT PUSHES TO MAIN**
- Forces everyone to use Pull Requests
- Most important setting for your goal!

---

##### ⚠️ **Rules applied to everyone including administrators**
```
☑️ Include administrators
```

**What this does:**
- Rules apply to you (the admin) too
- Ensures consistent workflow

---

##### 🚫 **Allow force pushes**
```
☐ Allow force pushes [UNCHECK THIS!]
```

**What this does:**
- Prevents `git push --force` to main
- Protects production history

---

##### 🗑️ **Allow deletions**
```
☐ Allow deletions [UNCHECK THIS!]
```

**What this does:**
- **PREVENTS ACCIDENTAL BRANCH DELETION**
- Main branch cannot be deleted
- Critical protection!

---

**Click "Create" or "Save changes"**

---

### **Step 3: Configure Protection for `development` Branch**

#### **Branch name pattern:**
```
development
```

#### **Protection Settings:**

##### 🗑️ **Allow deletions**
```
☐ Allow deletions [UNCHECK THIS!]
```

**What this does:**
- **PREVENTS ACCIDENTAL DELETION OF DEVELOPMENT BRANCH**
- Main goal for development branch

---

##### ⚠️ **Allow force pushes** (Your choice)
```
☐ Allow force pushes [Your choice]
```

**Options:**
- ☑️ Check: Allows rebasing and cleaning up commits
- ☐ Uncheck: More strict, prevents accidental force push

**Recommendation:** Leave unchecked for safety

---

##### ✅ **Require status checks** (Optional but recommended)
```
☑️ Require status checks to pass before merging
  ☑️ test-backend
  ☑️ test-frontend
```

**What this does:**
- Ensures code quality before merging features
- Catches bugs early

---

##### 🔐 **Require a pull request before merging** (Optional)
```
☐ Require a pull request before merging [Optional for dev]
```

**Your choice:**
- ☑️ Check: More strict, requires PRs for feature branches → development
- ☐ Uncheck: Allows direct push to development (more flexible)

**Recommendation:** Uncheck for flexibility, but check for larger teams

---

**Click "Create" or "Save changes"**

---

## 📊 **Summary of Protection Levels**

| Setting | `main` | `development` | Reason |
|---------|--------|---------------|--------|
| **Require PR** | ✅ Required | ⚠️ Optional | Main needs review, dev can be flexible |
| **Require approvals** | ✅ 1 approval | ❌ No | Ensure quality before production |
| **Status checks** | ✅ Required | ⚠️ Optional | CI/CD must pass |
| **Conversation resolution** | ✅ Yes | ❌ No | All feedback addressed |
| **Direct push** | ❌ Blocked | ✅ Allowed | Force PR workflow for main |
| **Force push** | ❌ Blocked | ❌ Blocked | Protect history |
| **Branch deletion** | ❌ Blocked | ❌ Blocked | **YOUR MAIN GOAL** ✅ |
| **Include admins** | ✅ Yes | ✅ Yes | Rules apply to everyone |

---

## 🔄 **Your New Workflow**

### **Scenario 1: Working on a Feature**

```bash
# ❌ OLD WAY (No longer possible)
git checkout main
git add .
git commit -m "changes"
git push origin main  # ❌ BLOCKED!

# ✅ NEW WAY (Enforced)
git checkout -b feature/my-awesome-feature
git add .
git commit -m "Add awesome feature"
git push origin feature/my-awesome-feature

# Then on GitHub:
# 1. Create Pull Request: feature/my-awesome-feature → development
# 2. Wait for CI checks to pass (test-backend, test-frontend)
# 3. Review and approve (or request changes)
# 4. Merge to development
# 5. Delete feature branch
```

---

### **Scenario 2: Deploying to Production**

```bash
# ❌ OLD WAY (No longer possible)
git checkout main
git merge development
git push origin main  # ❌ BLOCKED!

# ✅ NEW WAY (Enforced)
# On GitHub:
# 1. Create Pull Request: development → main
# 2. Wait for CI checks to pass
# 3. Review changes one more time
# 4. Require 1 approval (you can approve your own)
# 5. Merge to main (use "Squash and merge" or "Rebase and merge")

# Result:
# - Netlify auto-deploys frontend ✅
# - Render auto-deploys backend ✅
# - Trigger ETL if needed
```

---

### **Scenario 3: Trying to Delete a Branch (Prevented!)**

```bash
# ❌ Trying to delete main branch
git push origin --delete main
# Error: GitHub refuses (branch protection rules)

# ❌ Trying to delete development branch
git push origin --delete development
# Error: GitHub refuses (branch protection rules)

# ✅ To actually delete a branch (if needed):
# 1. Go to GitHub Settings → Branches
# 2. Temporarily disable protection for that branch
# 3. Delete the branch
# 4. Re-enable protection
# (But you shouldn't need to do this!)
```

---

## 🎯 **Testing Your Setup**

### **Test 1: Try Direct Push to Main (Should Fail)**
```bash
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test direct push"
git push origin main
```

**Expected Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To https://github.com/Chrisdalbano/valuebuild-web.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/Chrisdalbano/valuebuild-web.git'
```

✅ **SUCCESS!** Direct push is blocked.

---

### **Test 2: Try to Delete Main Branch (Should Fail)**
```bash
git push origin --delete main
```

**Expected Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Cannot delete a protected branch
To https://github.com/Chrisdalbano/valuebuild-web.git
 ! [remote rejected] main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/Chrisdalbano/valuebuild-web.git'
```

✅ **SUCCESS!** Branch deletion is blocked.

---

### **Test 3: Create PR (Should Work)**
```bash
git checkout -b test-branch
echo "test" >> test.txt
git add test.txt
git commit -m "test PR workflow"
git push origin test-branch
```

**Then on GitHub:**
1. Create Pull Request: test-branch → main
2. See status checks running
3. Wait for checks to pass
4. Approve and merge

✅ **SUCCESS!** PR workflow works correctly.

---

## 🚨 **Emergency: Bypassing Protection (When Needed)**

If you absolutely need to bypass protection (rare cases):

1. Go to GitHub Settings → Branches
2. Click "Edit" on the branch protection rule
3. Temporarily uncheck "Include administrators"
4. Make your changes
5. **IMMEDIATELY re-enable** "Include administrators"

**⚠️ Use sparingly!** This defeats the purpose of protection.

---

## 📚 **Additional Recommendations**

### **1. Set Default Branch for PRs**
In GitHub Settings → General:
- Default branch: `development`
- This makes PRs default to development instead of main

### **2. Enable Branch Auto-Delete**
In GitHub Settings → General → Pull Requests:
- ☑️ Automatically delete head branches
- Cleans up merged feature branches

### **3. Set Up Status Badges**
Add to your `README.md`:
```markdown
![CI/CD](https://github.com/Chrisdalbano/valuebuild-web/workflows/Deploy%20to%20Production/badge.svg)
```

### **4. Configure Merge Button**
In GitHub Settings → General → Pull Requests:
- ☑️ Allow squash merging (recommended)
- ☑️ Allow rebase merging
- ☐ Allow merge commits (disable for cleaner history)

---

## 🎓 **Learning Resources**

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## ✅ **Checklist**

After setting up, verify:

- [ ] Branch protection rule created for `main`
- [ ] Branch protection rule created for `development`
- [ ] Direct push to `main` is blocked
- [ ] Branch deletion is blocked for both branches
- [ ] Status checks are required
- [ ] Pull requests are required for `main`
- [ ] CODEOWNERS file exists
- [ ] PR template exists
- [ ] Tested workflow with a test branch
- [ ] Documented workflow for team (if applicable)

---

## 🎉 **Congratulations!**

Your repository now has:
- ✅ Protected `main` branch (no direct pushes)
- ✅ Protected `development` branch (no deletion)
- ✅ Enforced CI/CD workflow
- ✅ Code review process
- ✅ Professional development workflow

**Your branches are now safe from accidental changes and deletions!** 🛡️

