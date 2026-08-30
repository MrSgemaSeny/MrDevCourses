-- Migration V15: Grant ADMIN role to mrsgemaseny
UPDATE users 
SET role = 'ADMIN' 
WHERE LOWER(email) LIKE '%mrsgemaseny%' 
   OR LOWER(name) LIKE '%mrsgemaseny%' 
   OR email = 'orkathebestt@gmail.com'
   OR email = 'mrsgemaseny@gmail.com'
   OR email = 'mrsgemaseny';
