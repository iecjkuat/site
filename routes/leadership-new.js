const express = require('express');
const router = express.Router();
const { supabaseAdmin: supabase } = require('../lib/supabase');
const multer = require('multer');
const path = require('path');

// Multer config for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper to format executive member
const formatExecutive = (exec) => ({
  ...exec,
  clubId: exec.club_id,
  userId: exec.user_id,
  profileImageUrl: exec.profile_image_url,
  storagePath: exec.storage_path,
  officeHours: exec.office_hours,
  termStartDate: exec.term_start_date,
  termEndDate: exec.term_end_date,
  isActive: exec.is_active,
  displayOrder: exec.display_order,
  socialLinks: exec.social_links,
  createdAt: exec.created_at,
  updatedAt: exec.updated_at,
  yearOfStudy: exec.year_of_study
});

// Helper to format patron
const formatPatron = (patron) => ({
  ...patron,
  clubId: patron.club_id,
  profileImageUrl: patron.profile_image_url,
  storagePath: patron.storage_path,
  officeLocation: patron.office_location,
  isActive: patron.is_active,
  displayOrder: patron.display_order,
  socialLinks: patron.social_links,
  createdAt: patron.created_at,
  updatedAt: patron.updated_at
});

// Get all executive committee members
router.get('/executive', async (req, res) => {
  try {
    const { clubId, isActive } = req.query;

    let query = supabase
      .from('executive_committee')
      .select('*')
      .order('display_order', { ascending: true });

    if (clubId) query = query.eq('club_id', clubId);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      executives: data.map(formatExecutive)
    });
  } catch (error) {
    console.error('Error fetching executives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all club patrons
router.get('/patrons', async (req, res) => {
  try {
    const { clubId, isActive } = req.query;

    let query = supabase
      .from('club_patrons')
      .select('*')
      .order('display_order', { ascending: true });

    if (clubId) query = query.eq('club_id', clubId);
    if (isActive !== undefined) query = query.eq('is_active', isActive === 'true');

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      patrons: data.map(formatPatron)
    });
  } catch (error) {
    console.error('Error fetching patrons:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leadership stats
router.get('/stats', async (req, res) => {
  try {
    const { clubId } = req.query;

    let execQuery = supabase.from('executive_committee').select('*', { count: 'exact', head: true });
    let patronQuery = supabase.from('club_patrons').select('*', { count: 'exact', head: true });

    if (clubId) {
      execQuery = execQuery.eq('club_id', clubId);
      patronQuery = patronQuery.eq('club_id', clubId);
    }

    const [{ count: execCount }, { count: patronCount }] = await Promise.all([
      execQuery,
      patronQuery
    ]);

    res.json({
      executiveCount: execCount || 0,
      patronCount: patronCount || 0,
      totalLeadership: (execCount || 0) + (patronCount || 0)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create executive member (with image upload)
router.post('/executive', upload.single('profileImage'), async (req, res) => {
  try {
    const {
      clubId, name, position, email, phone, bio, course, yearOfStudy,
      officeHours, termStartDate, termEndDate, displayOrder, socialLinks
    } = req.body;

    if (!clubId || !name || !position) {
      return res.status(400).json({ message: 'Club ID, name, and position are required' });
    }

    let profileImageUrl = null;
    let storagePath = null;

    // Upload image if provided
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      storagePath = `executive/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leadership')
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leadership')
        .getPublicUrl(storagePath);

      profileImageUrl = publicUrl;
    }

    // Insert into database
    const { data, error } = await supabase
      .from('executive_committee')
      .insert({
        club_id: clubId,
        name,
        position,
        email,
        phone,
        bio,
        course,
        year_of_study: yearOfStudy,
        profile_image_url: profileImageUrl,
        storage_path: storagePath,
        office_hours: officeHours,
        term_start_date: termStartDate,
        term_end_date: termEndDate,
        display_order: displayOrder || 0,
        social_links: socialLinks ? JSON.parse(socialLinks) : {}
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Executive member created successfully',
      executive: formatExecutive(data)
    });
  } catch (error) {
    console.error('Error creating executive:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Create patron (with image upload)
router.post('/patrons', upload.single('profileImage'), async (req, res) => {
  try {
    const {
      clubId, name, title, department, email, phone, officeLocation, bio,
      specialization, displayOrder, socialLinks
    } = req.body;

    if (!clubId || !name || !title) {
      return res.status(400).json({ message: 'Club ID, name, and title are required' });
    }

    let profileImageUrl = null;
    let storagePath = null;

    // Upload image if provided
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      storagePath = `patrons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leadership')
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload image' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leadership')
        .getPublicUrl(storagePath);

      profileImageUrl = publicUrl;
    }

    // Parse specialization array
    const specializationArray = specialization ? 
      (typeof specialization === 'string' ? JSON.parse(specialization) : specialization) : [];

    // Insert into database
    const { data, error } = await supabase
      .from('club_patrons')
      .insert({
        club_id: clubId,
        name,
        title,
        department,
        email,
        phone,
        office_location: officeLocation,
        bio,
        specialization: specializationArray,
        profile_image_url: profileImageUrl,
        storage_path: storagePath,
        display_order: displayOrder || 0,
        social_links: socialLinks ? JSON.parse(socialLinks) : {}
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Patron created successfully',
      patron: formatPatron(data)
    });
  } catch (error) {
    console.error('Error creating patron:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update executive member
router.put('/executive/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle image upload if provided
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      const storagePath = `executive/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leadership')
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        return res.status(500).json({ message: 'Failed to upload image' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leadership')
        .getPublicUrl(storagePath);

      updateData.profile_image_url = publicUrl;
      updateData.storage_path = storagePath;
    }

    // Convert camelCase to snake_case for database
    const dbData = {
      name: updateData.name,
      position: updateData.position,
      email: updateData.email,
      phone: updateData.phone,
      bio: updateData.bio,
      course: updateData.course,
      year_of_study: updateData.yearOfStudy,
      office_hours: updateData.officeHours,
      term_start_date: updateData.termStartDate,
      term_end_date: updateData.termEndDate,
      is_active: updateData.isActive,
      display_order: updateData.displayOrder,
      social_links: updateData.socialLinks ? JSON.parse(updateData.socialLinks) : undefined,
      profile_image_url: updateData.profile_image_url,
      storage_path: updateData.storage_path
    };

    // Remove undefined values
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    const { data, error } = await supabase
      .from('executive_committee')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Executive member updated successfully',
      executive: formatExecutive(data)
    });
  } catch (error) {
    console.error('Error updating executive:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update patron
router.put('/patrons/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle image upload if provided
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
      const storagePath = `patrons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leadership')
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        return res.status(500).json({ message: 'Failed to upload image' });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('leadership')
        .getPublicUrl(storagePath);

      updateData.profile_image_url = publicUrl;
      updateData.storage_path = storagePath;
    }

    // Convert camelCase to snake_case for database
    const dbData = {
      name: updateData.name,
      title: updateData.title,
      department: updateData.department,
      email: updateData.email,
      phone: updateData.phone,
      office_location: updateData.officeLocation,
      bio: updateData.bio,
      specialization: updateData.specialization ? JSON.parse(updateData.specialization) : undefined,
      is_active: updateData.isActive,
      display_order: updateData.displayOrder,
      social_links: updateData.socialLinks ? JSON.parse(updateData.socialLinks) : undefined,
      profile_image_url: updateData.profile_image_url,
      storage_path: updateData.storage_path
    };

    // Remove undefined values
    Object.keys(dbData).forEach(key => dbData[key] === undefined && delete dbData[key]);

    const { data, error } = await supabase
      .from('club_patrons')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Patron updated successfully',
      patron: formatPatron(data)
    });
  } catch (error) {
    console.error('Error updating patron:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete executive member
router.delete('/executive/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get storage path before deleting
    const { data: executive } = await supabase
      .from('executive_committee')
      .select('storage_path')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('executive_committee')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete image from storage if exists
    if (executive?.storage_path) {
      await supabase.storage
        .from('leadership')
        .remove([executive.storage_path]);
    }

    res.json({ message: 'Executive member deleted successfully' });
  } catch (error) {
    console.error('Error deleting executive:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patron
router.delete('/patrons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get storage path before deleting
    const { data: patron } = await supabase
      .from('club_patrons')
      .select('storage_path')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('club_patrons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete image from storage if exists
    if (patron?.storage_path) {
      await supabase.storage
        .from('leadership')
        .remove([patron.storage_path]);
    }

    res.json({ message: 'Patron deleted successfully' });
  } catch (error) {
    console.error('Error deleting patron:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
