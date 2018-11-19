import hashlib
import binascii

source = 80983319441314868089080337051836699235937493047531196261520136729797941944062
result = 'a52eb9eb93defa0483573d22870246d59b83305a252dae06af7200'
print(result)

b = source.to_bytes(54, 'big')
m = hashlib.sha256()
m.update(b)
print(m.hexdigest()[10:])
