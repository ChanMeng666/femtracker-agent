# CopilotKit Action Conflicts Fix

## 🚨 Problem Description

When navigating to the `/cycle-tracker` page, users encountered:
- Page stuck in loading state
- Error message: **"Found an already registered action with name addSymptom. ✕"**
- Application crash due to CopilotKit action name conflicts

## 🔍 Root Cause Analysis

The issue was caused by **duplicate CopilotKit action registrations** when multiple hooks tried to register actions with the same name:

### **Conflicting Actions Identified:**

1. **`addSymptom`** conflicts:
   - `src/hooks/data/useSymptomsMoods.ts` 
   - `src/hooks/useCycleWithDB.ts` ✅ **Fixed: renamed to `addCycleSymptom`**

2. **`updateMood`** conflicts:
   - `src/hooks/data/useSymptomsMoods.ts` (has `addMood`)
   - `src/hooks/useCycleWithDB.ts` ✅ **Fixed: renamed to `updateCycleMood`**
   - `src/hooks/useCycle.ts` ✅ **Fixed: renamed to `updateMoodLocal`**

3. **`switchSettingsTab`** conflicts:
   - `src/hooks/useSettingsWithDB.ts` (primary - database version)
   - `src/hooks/useSettings.ts` ✅ **Fixed: renamed to `switchSettingsTabLocal`**
   - `src/hooks/settings/useSettingsActions.ts` (modular version)

4. **`updateUserProfile`** conflicts:
   - `src/hooks/useSettingsWithDB.ts` (primary - database version)  
   - `src/hooks/useSettings.ts` ✅ **Fixed: renamed to `updateUserProfileLocal`**

5. **`updateNotificationSettings`** conflicts:
   - `src/hooks/useSettingsWithDB.ts` (primary - database version)
   - `src/hooks/useSettings.ts` ✅ **Fixed: renamed to `updateNotificationSettingsLocal`**

## 💡 Solution Strategy

### **Naming Convention Applied:**

1. **Database hooks** (primary versions): Keep original names
   - `useSettingsWithDB.ts` → `switchSettingsTab`, `updateUserProfile`, etc.
   - `useSymptomsMoods.ts` → `addSymptom`, `addMood`

2. **Cycle-specific hooks**: Add `Cycle` prefix
   - `useCycleWithDB.ts` → `addCycleSymptom`, `updateCycleMood`

3. **Local/legacy hooks**: Add `Local` suffix  
   - `useSettings.ts` → `switchSettingsTabLocal`, `updateUserProfileLocal`
   - `useCycle.ts` → `updateCycleDayLocal`, `updateMoodLocal`

## 🔧 Files Modified

### **Primary Fixes (Cycle Tracker):**
```typescript
// src/hooks/useCycleWithDB.ts
- name: "addSymptom" → name: "addCycleSymptom"
- name: "updateMood" → name: "updateCycleMood"
```

### **Secondary Fixes (Legacy Conflicts):**
```typescript
// src/hooks/useSettings.ts  
- name: "switchSettingsTab" → name: "switchSettingsTabLocal"
- name: "updateUserProfile" → name: "updateUserProfileLocal"
- name: "updateNotificationSettings" → name: "updateNotificationSettingsLocal"

// src/hooks/useCycle.ts
- name: "updateCycleDay" → name: "updateCycleDayLocal" 
- name: "updateMood" → name: "updateMoodLocal"
```

## 🧪 Expected Results

### ✅ **After Fix:**
- `/cycle-tracker` page loads successfully
- No CopilotKit action registration errors
- All AI actions work with distinct names
- No conflicts between different page hooks

### 📊 **Action Name Mapping:**
| Function | Database Hook | Cycle Hook | Local Hook |
|----------|---------------|------------|------------|
| Add Symptom | `addSymptom` | `addCycleSymptom` | - |
| Update Mood | `addMood` | `updateCycleMood` | `updateMoodLocal` |
| Settings Tab | `switchSettingsTab` | - | `switchSettingsTabLocal` |
| User Profile | `updateUserProfile` | - | `updateUserProfileLocal` |

## 🛠 Prevention Strategy

1. **Naming Convention**: Use descriptive prefixes/suffixes for hook-specific actions
2. **Centralized Actions**: Prefer database-backed hooks over local state hooks
3. **Hook Cleanup**: Remove or rename legacy hooks to avoid conflicts
4. **Documentation**: Maintain clear mapping of action names to prevent future conflicts

## 🎯 Technical Benefits

- ✅ **Eliminates crashes** from duplicate action registration
- ⚡ **Faster page loading** without CopilotKit conflicts  
- 🧹 **Cleaner architecture** with distinct action namespaces
- 🔄 **Scalable solution** for future hook additions
- 🎯 **Better AI integration** with specific, contextual action names 