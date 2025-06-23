import { useState, useCallback } from 'react';
import { supabaseRest } from '@/lib/supabase/restClient';

type Status = 'idle' | 'success' | 'error';

// 数据类别对应的表映射
const categoryTableMap: Record<string, string[]> = {
  cycle: ['menstrual_cycles', 'period_days'],
  symptoms: ['symptoms', 'moods'],
  exercise: ['exercises'],
  nutrition: ['meals', 'water_intake', 'nutrition_focus'],
  fertility: ['fertility_records', 'bbt_records', 'ovulation_tests'],
  lifestyle: ['lifestyle_entries'],
  insights: ['health_insights', 'ai_insights', 'health_metrics', 'correlation_analyses'],
  recipes: ['recipes', 'recipe_collections', 'recipe_collection_items'],
  settings: ['quick_records', 'notifications', 'notification_rules', 'personalized_tips', 'health_overview']
};

// 所有用户数据表（不包括 profiles 和 user_preferences）
const allUserDataTables = [
  'menstrual_cycles',
  'period_days', 
  'symptoms',
  'moods',
  'exercises',
  'meals',
  'water_intake',
  'nutrition_focus',
  'fertility_records',
  'bbt_records',
  'ovulation_tests',
  'lifestyle_entries',
  'health_insights',
  'ai_insights',
  'health_metrics',
  'correlation_analyses',
  'recipes',
  'recipe_collections',
  'recipe_collection_items',
  'quick_records',
  'notifications',
  'notification_rules',
  'personalized_tips',
  'health_overview'
];

// 表的删除优先级（有外键依赖的表需要先删除）
const deletionOrder = [
  // 首先删除有外键依赖的表
  'period_days',           // 依赖 menstrual_cycles
  'recipe_collection_items', // 依赖 recipes 和 recipe_collections
  'notifications',         // 依赖 notification_rules（可能）
  
  // 然后删除主表
  'menstrual_cycles',
  'symptoms',
  'moods', 
  'exercises',
  'meals',
  'water_intake',
  'nutrition_focus',
  'fertility_records',
  'bbt_records',
  'ovulation_tests',
  'lifestyle_entries',
  'health_insights',
  'ai_insights',
  'health_metrics',
  'correlation_analyses',
  'recipes',
  'recipe_collections',
  'quick_records',
  'notification_rules',
  'personalized_tips',
  'health_overview'
];

export function useDataDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<Status>('idle');
  const [deleteMessage, setDeleteMessage] = useState<string>('');

  const supabase = supabaseRest;

  const deleteDataFromTables = useCallback(async (categories: string[], deleteAll: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      // 验证用户身份
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        return {
          success: false,
          message: 'User not authenticated. Please log in and try again.'
        };
      }

      const userId = (sessionData.session as any).user?.id;
      if (!userId) {
        return {
          success: false,
          message: 'Unable to get user ID. Please log in again.'
        };
      }

      // 确定要删除的表
      let tablesToDelete: string[] = [];
      if (deleteAll) {
        tablesToDelete = [...allUserDataTables];
      } else {
        tablesToDelete = categories.reduce((tables: string[], category: string) => {
          const categoryTables = categoryTableMap[category] || [];
          return [...tables, ...categoryTables];
        }, []);
        
        tablesToDelete = Array.from(new Set(tablesToDelete));
      }

      if (tablesToDelete.length === 0) {
        return {
          success: false,
          message: 'No tables selected for deletion'
        };
      }

      // 按顺序删除数据 - 使用项目的 REST API 方法
      let deletedCount = 0;
      const failedTables: string[] = [];
      const successTables: string[] = [];

      const orderedTablesToDelete = deletionOrder.filter(table => tablesToDelete.includes(table));

      for (const table of orderedTablesToDelete) {
        try {
          console.log(`Deleting data from table: ${table} for user: ${userId}`);
          
          let deleteResult;
          
          // 特殊处理没有 user_id 字段的表
          if (table === 'period_days') {
            // period_days 通过 cycle_id 关联到 menstrual_cycles
            // 由于 menstrual_cycles 已被删除，这些记录应该通过级联删除自动清理
            // 但我们还是明确删除剩余的记录
            deleteResult = await supabase
              .from(table)
              .delete()
              .gte('created_at', '1970-01-01'); // 删除所有记录，RLS 会限制范围
          } else if (table === 'recipe_collection_items') {
            // recipe_collection_items 通过 recipe_id 关联到 recipes 
            // 由于 recipes 已被删除，这些记录应该通过级联删除自动清理
            // 但我们还是明确删除剩余的记录
            deleteResult = await supabase
              .from(table)
              .delete()
              .gte('added_at', '1970-01-01'); // 删除所有记录，RLS 会限制范围
          } else {
            // 有 user_id 字段的正常表
            deleteResult = await supabase
              .from(table)
              .delete()
              .eq('user_id', userId);
          }

          if (deleteResult.error) {
            console.error(`Failed to delete from ${table}:`, deleteResult.error);
            failedTables.push(table);
          } else {
            deletedCount++;
            successTables.push(table);
            console.log(`Successfully deleted data from ${table}`);
          }
        } catch (err) {
          console.error(`Error deleting from ${table}:`, err);
          failedTables.push(table);
        }
      }

      // 返回结果
      if (failedTables.length === 0) {
        return {
          success: true,
          message: `Successfully deleted data from ${deletedCount} table(s)`
        };
      } else if (failedTables.length < orderedTablesToDelete.length) {
        return {
          success: true,
          message: `Partially completed: ${deletedCount} tables deleted, ${failedTables.length} failed: ${failedTables.join(', ')}`
        };
      } else {
        return {
          success: false,
          message: `Failed to delete data from all tables: ${failedTables.join(', ')}`
        };
      }
    } catch (error) {
      console.error('Data deletion error:', error);
      return {
        success: false,
        message: `Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [supabase]);

  const handleDeleteData = useCallback(async (categories: string[], deleteAll: boolean) => {
    setIsDeleting(true);
    setDeleteStatus('idle');
    setDeleteMessage('');

    try {
      if (!deleteAll && categories.length === 0) {
        setDeleteStatus('error');
        setDeleteMessage('No categories selected for deletion');
        return;
      }

      console.log('Starting data deletion:', { categories, deleteAll });

      const result = await deleteDataFromTables(categories, deleteAll);

      if (result.success) {
        setDeleteStatus('success');
        setDeleteMessage(result.message);
        
        // 触发全局状态刷新
        window.dispatchEvent(new CustomEvent('dataDeleted', { 
          detail: { categories, deleteAll } 
        }));
      } else {
        setDeleteStatus('error');
        setDeleteMessage(result.message);
      }
    } catch (error) {
      console.error('Data deletion process failed:', error);
      setDeleteStatus('error');
      setDeleteMessage(`Deletion process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteDataFromTables]);

  const resetStatus = useCallback(() => {
    setDeleteStatus('idle');
    setDeleteMessage('');
  }, []);

  return {
    isDeleting,
    deleteStatus,
    deleteMessage,
    handleDeleteData,
    resetStatus
  };
} 