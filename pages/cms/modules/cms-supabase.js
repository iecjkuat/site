/**
 * CMS Supabase Module
 * Handles all Supabase database operations with error handling
 */

export class CMSSupabase {
    static getSb() {
        const sb = window.supabaseClient;
        if (!sb) throw new Error("Supabase client not ready");
        return sb;
    }

    static async getCount(table) {
        try {
            const { count, error } = await this.getSb()
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.warn(`Count failed for ${table}:`, error);
            return 0;
        }
    }

    static async insert(table, data) {
        const { data: result, error } = await this.getSb()
            .from(table)
            .insert([data])
            .select();
        
        if (error) throw error;
        return result;
    }

    static async update(table, id, data) {
        const { data: result, error } = await this.getSb()
            .from(table)
            .update(data)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        return result;
    }

    static async delete(table, id) {
        const { error } = await this.getSb()
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }

    static async select(table, options = {}) {
        let query = this.getSb().from(table).select('*');
        
        if (options.orderBy) {
            query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.filter) {
            for (const [field, value] of Object.entries(options.filter)) {
                query = query.eq(field, value);
            }
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    static async uploadFile(bucket, path, file) {
        const { data, error } = await this.getSb()
            .storage
            .from(bucket)
            .upload(path, file);
        
        if (error) throw error;
        return data;
    }

    static async deleteFile(bucket, path) {
        const { error } = await this.getSb()
            .storage
            .from(bucket)
            .remove([path]);
        
        if (error) throw error;
        return true;
    }

    static getPublicUrl(bucket, path) {
        const { data } = this.getSb()
            .storage
            .from(bucket)
            .getPublicUrl(path);
        
        return data.publicUrl;
    }

    static async checkTableExists(tableName) {
        try {
            await this.getSb().from(tableName).select('*').limit(1);
            return true;
        } catch (error) {
            return false;
        }
    }
}